"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, Pause, Play, RefreshCw } from "lucide-react";
import { ExerciseAnimation } from "@/components/ExerciseAnimation";
import { allowedEquipment, defaultPrescription, type Exercise } from "@/lib/exercises";
import { saveWorkout } from "@/app/actions";

interface Props {
  date: string;
  dayLabel: string;
  isRest: boolean;
  muscles: string[];
  equipment: string;
  experience: string;
  weekPlan: string[];
  cautions: string[];
  substituteHighImpact: boolean;
  substituteSpinalLoad: boolean;
}

// Lifts/keywords to de-prioritise for joint/back issues.
const HIGH_IMPACT = ["jump", "box jump", "burpee", "sprint", "squat"];
const SPINAL_LOAD = ["deadlift", "barbell squat", "good morning", "bent over", "overhead press"];

interface ChosenExercise extends Exercise {
  sets: { reps: number; weight: number; done: boolean }[];
}

export function WorkoutSession(props: Props) {
  const router = useRouter();
  const [all, setAll] = useState<Exercise[] | null>(null);
  const [chosen, setChosen] = useState<ChosenExercise[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the committed dataset.
  useEffect(() => {
    if (props.isRest) return;
    fetch("/data/exercises.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Exercise[]) => setAll(data))
      .catch(() => setError("Couldn't load exercise data. See README to add /public/data/exercises.json."));
  }, [props.isRest]);

  const prescription = useMemo(() => defaultPrescription(props.experience), [props.experience]);

  // Build the day's workout once data is ready.
  useEffect(() => {
    if (!all || props.isRest) return;
    const allowed = allowedEquipment(props.equipment);
    const perMuscle = props.experience === "advanced" ? 2 : 1;
    const picked: Exercise[] = [];
    const seen = new Set<string>();

    for (const muscle of props.muscles) {
      const candidates = all
        .filter((e) => e.primaryMuscles.includes(muscle))
        .filter((e) => !allowed || (e.equipment && allowed.includes(e.equipment)))
        .filter((e) => {
          const name = e.name.toLowerCase();
          if (props.substituteHighImpact && HIGH_IMPACT.some((k) => name.includes(k))) return false;
          if (props.substituteSpinalLoad && SPINAL_LOAD.some((k) => name.includes(k))) return false;
          return true;
        })
        // beginners → prefer compound/beginner-level
        .sort((a, b) => {
          const score = (e: Exercise) =>
            (e.mechanic === "compound" ? -2 : 0) + (e.level === "beginner" ? -1 : 0);
          return score(a) - score(b);
        });
      for (const c of candidates.slice(0, perMuscle)) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          picked.push(c);
        }
      }
    }
    setChosen(
      picked.map((e) => ({
        ...e,
        sets: Array.from({ length: prescription.sets }, () => ({ reps: 10, weight: 0, done: false })),
      }))
    );
  }, [all, props, prescription.sets]);

  // Timer
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  function updateSet(exIdx: number, setIdx: number, patch: Partial<{ reps: number; weight: number; done: boolean }>) {
    setChosen((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) } : ex
      )
    );
  }

  function swapExercise(exIdx: number) {
    if (!all) return;
    const current = chosen[exIdx];
    const muscle = current.primaryMuscles[0];
    const allowed = allowedEquipment(props.equipment);
    const alt = all.find(
      (e) => e.primaryMuscles.includes(muscle) && e.id !== current.id && (!allowed || (e.equipment && allowed.includes(e.equipment)))
    );
    if (alt) setChosen((prev) => prev.map((ex, i) => (i === exIdx ? { ...alt, sets: ex.sets } : ex)));
  }

  async function finish() {
    setSaving(true);
    setError(null);
    const sets = chosen.flatMap((ex) =>
      ex.sets
        .filter((s) => s.done)
        .map((s, idx) => ({ exerciseId: ex.id, exerciseName: ex.name, setNumber: idx + 1, reps: s.reps, weightKg: s.weight }))
    );
    const res = await saveWorkout({ date: props.date, dayType: props.dayLabel, durationSeconds: seconds, sets });
    setSaving(false);
    if (!res.ok) setError("Couldn't save workout.");
    else {
      setSaved(true);
      router.refresh();
    }
  }

  if (props.isRest) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Rest day 😴</h1>
        <div className="card text-center">
          <p className="text-slate-600 dark:text-slate-400">Recovery is when you grow. Light walking and good sleep today.</p>
        </div>
        <WeekStrip plan={props.weekPlan} current={props.dayLabel} />
      </div>
    );
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{props.dayLabel}</h1>
          <p className="text-sm text-slate-500">{prescription.sets} sets × {prescription.reps} reps</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl tabular-nums">{mm}:{ss}</span>
          <button onClick={() => setRunning((r) => !r)} className="btn-ghost !p-2.5">
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {props.cautions.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <ul className="space-y-1">{props.cautions.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {!all && !error && <div className="card flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading exercises…</div>}

      {chosen.map((ex, exIdx) => (
        <section key={ex.id + exIdx} className="card">
          <div className="flex gap-3">
            <ExerciseAnimation images={ex.images} alt={ex.name} className="h-20 w-20 shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold capitalize">{ex.name}</h3>
              <p className="text-xs capitalize text-slate-500">{ex.primaryMuscles.join(", ")} · {ex.equipment}</p>
              <button onClick={() => swapExercise(exIdx)} className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600">
                <RefreshCw className="h-3 w-3" /> Swap
              </button>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {ex.sets.map((s, setIdx) => (
              <div key={setIdx} className="flex items-center gap-2">
                <span className="w-10 text-xs text-slate-500">Set {setIdx + 1}</span>
                <input type="number" value={s.reps} onChange={(e) => updateSet(exIdx, setIdx, { reps: Number(e.target.value) })} className="input !py-1.5 w-20" aria-label="reps" />
                <span className="text-xs text-slate-400">reps</span>
                <input type="number" value={s.weight} onChange={(e) => updateSet(exIdx, setIdx, { weight: Number(e.target.value) })} className="input !py-1.5 w-20" aria-label="weight kg" />
                <span className="text-xs text-slate-400">kg</span>
                <button onClick={() => updateSet(exIdx, setIdx, { done: !s.done })} className={`ml-auto rounded-lg p-2 ${s.done ? "text-brand-500" : "text-slate-300"}`}>
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {chosen.length > 0 && (
        <button onClick={finish} disabled={saving || saved} className="btn-primary w-full">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saved ? "Workout saved ✓" : "Finish workout"}
        </button>
      )}

      <WeekStrip plan={props.weekPlan} current={props.dayLabel} />
    </div>
  );
}

function WeekStrip({ plan, current }: { plan: string[]; current: string }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="card">
      <h3 className="mb-2 text-sm font-semibold text-slate-500">This week</h3>
      <div className="grid grid-cols-7 gap-1 text-center">
        {plan.map((label, i) => (
          <div key={i} className={`rounded-lg p-1.5 text-[10px] ${label === current ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
            <div className="font-semibold">{days[i]}</div>
            <div className="truncate">{label === "Rest" ? "💤" : label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
