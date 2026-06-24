"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import {
  ACTIVITY_LEVELS,
  ALLERGY_OPTIONS,
  CONDITIONS,
  DIET_TYPES,
  EQUIPMENT,
  EXPERIENCES,
  GENDERS,
  GOALS,
} from "@/lib/constants";
import { SERIOUS_CONDITIONS } from "@/lib/types";
import { completeOnboarding } from "@/app/actions";
import { onboardingSchema } from "@/lib/validation";

type Draft = Record<string, any>;

const STEPS = ["Goal", "About you", "Activity", "Diet", "Health", "Review"];

export function OnboardingWizard({ initial, fullName }: { initial: Draft; fullName: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>({ unit: "metric", ...initial });
  const [error, setError] = useState<string | null>(null);
  const [showMedModal, setShowMedModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (patch: Draft) => setD((prev) => ({ ...prev, ...patch }));

  const hasSerious = useMemo(
    () => (d.conditions ?? []).some((c: string) => SERIOUS_CONDITIONS.includes(c as any)),
    [d.conditions]
  );

  function toggleArr(key: string, value: string) {
    const arr: string[] = d[key] ?? [];
    set({ [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] });
  }

  function validateStep(): boolean {
    setError(null);
    if (step === 0 && !d.goal) return fail("Pick a goal");
    if (step === 1) {
      if (!d.gender) return fail("Select gender");
      if (!d.age || !d.heightCm || !d.currentWeightKg) return fail("Fill in age, height and weight");
    }
    if (step === 2) {
      if (!d.activityLevel || !d.experience || !d.daysPerWeek || !d.equipment)
        return fail("Answer all activity questions");
    }
    if (step === 3 && !d.dietType) return fail("Pick a diet type");
    return true;
  }
  function fail(m: string) {
    setError(m);
    return false;
  }

  function next() {
    if (!validateStep()) return;
    // Health step → if serious condition and not yet acknowledged, force modal.
    if (step === 4 && hasSerious && !d.medicalAck) {
      setShowMedModal(true);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit() {
    setError(null);
    const payload = {
      goal: d.goal,
      gender: d.gender,
      age: Number(d.age),
      heightCm: Number(d.heightCm),
      currentWeightKg: Number(d.currentWeightKg),
      targetWeightKg: d.targetWeightKg ? Number(d.targetWeightKg) : null,
      activityLevel: d.activityLevel,
      experience: d.experience,
      daysPerWeek: Number(d.daysPerWeek),
      equipment: d.equipment,
      dietType: d.dietType,
      allergies: [...(d.allergies ?? []), ...(d.allergyText ? [d.allergyText] : [])],
      conditions: (d.conditions ?? []).length ? d.conditions : ["none"],
      medicalAck: !!d.medicalAck,
    };
    const parsed = onboardingSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const res = await completeOnboarding(payload);
    if (!res.ok) {
      setSubmitting(false);
      setError(res.error ?? "Something went wrong");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      {/* progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <div className="animate-fade-in">
        {step === 0 && (
          <Section title={`Hi${fullName ? ` ${fullName.split(" ")[0]}` : ""}! What's your main goal?`}>
            <div className="grid gap-3">
              {GOALS.map((g) => (
                <Card key={g.value} active={d.goal === g.value} onClick={() => set({ goal: g.value })}>
                  <span className="text-2xl">{g.emoji}</span>
                  <div>
                    <div className="font-semibold">{g.label}</div>
                    <div className="text-xs text-slate-500">{g.desc}</div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {step === 1 && (
          <Section title="Tell us about you">
            <label className="label">Gender</label>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {GENDERS.map((g) => (
                <Pill key={g.value} active={d.gender === g.value} onClick={() => set({ gender: g.value })}>{g.label}</Pill>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age (years)"><input type="number" className="input" value={d.age ?? ""} onChange={(e) => set({ age: e.target.value })} /></Field>
              <Field label="Height (cm)"><input type="number" className="input" value={d.heightCm ?? ""} onChange={(e) => set({ heightCm: e.target.value })} /></Field>
              <Field label="Weight (kg)"><input type="number" className="input" value={d.currentWeightKg ?? ""} onChange={(e) => set({ currentWeightKg: e.target.value })} /></Field>
              <Field label="Target weight (kg, optional)"><input type="number" className="input" value={d.targetWeightKg ?? ""} onChange={(e) => set({ targetWeightKg: e.target.value })} /></Field>
            </div>
            <p className="mt-2 text-xs text-slate-400">Tip: 1 ft = 30.48 cm · 1 lb = 0.4536 kg</p>
          </Section>
        )}

        {step === 2 && (
          <Section title="Your activity & training">
            <label className="label">Daily activity level</label>
            <div className="mb-4 grid gap-2">
              {ACTIVITY_LEVELS.map((a) => (
                <Card key={a.value} active={d.activityLevel === a.value} onClick={() => set({ activityLevel: a.value })}>
                  <div><div className="font-medium">{a.label}</div><div className="text-xs text-slate-500">{a.desc}</div></div>
                </Card>
              ))}
            </div>
            <label className="label">Experience</label>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {EXPERIENCES.map((e) => (<Pill key={e.value} active={d.experience === e.value} onClick={() => set({ experience: e.value })}>{e.label}</Pill>))}
            </div>
            <label className="label">Days per week you can train</label>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map((n) => (<Pill key={n} active={Number(d.daysPerWeek) === n} onClick={() => set({ daysPerWeek: n })}>{n}</Pill>))}
            </div>
            <label className="label">Equipment access</label>
            <div className="grid gap-2">
              {EQUIPMENT.map((eq) => (<Pill key={eq.value} active={d.equipment === eq.value} onClick={() => set({ equipment: eq.value })}>{eq.label}</Pill>))}
            </div>
          </Section>
        )}

        {step === 3 && (
          <Section title="Diet preferences">
            <label className="label">Diet type</label>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {DIET_TYPES.map((dt) => (<Pill key={dt.value} active={d.dietType === dt.value} onClick={() => set({ dietType: dt.value })}>{dt.label}</Pill>))}
            </div>
            <label className="label">Allergies / foods to avoid</label>
            <div className="mb-3 flex flex-wrap gap-2">
              {ALLERGY_OPTIONS.map((a) => (<Pill key={a} active={(d.allergies ?? []).includes(a)} onClick={() => toggleArr("allergies", a)}>{a}</Pill>))}
            </div>
            <input className="input" placeholder="Anything else to avoid? (free text)" value={d.allergyText ?? ""} onChange={(e) => set({ allergyText: e.target.value })} />
          </Section>
        )}

        {step === 4 && (
          <Section title="Any health conditions?">
            <p className="mb-3 text-sm text-slate-500">Select all that apply, or “None”. This helps us flag foods and adjust exercises. It is not a diagnosis.</p>
            <div className="grid gap-2">
              <Pill active={(d.conditions ?? []).length === 0} onClick={() => set({ conditions: [] })}>None</Pill>
              {CONDITIONS.map((c) => (
                <Pill key={c.value} active={(d.conditions ?? []).includes(c.value)} onClick={() => toggleArr("conditions", c.value)}>
                  {c.label}{c.serious ? " ⚠️" : ""}
                </Pill>
              ))}
            </div>
            <input className="input mt-3" placeholder="Other condition (free text)" value={d.conditionText ?? ""} onChange={(e) => set({ conditionText: e.target.value })} />
          </Section>
        )}

        {step === 5 && (
          <Section title="Review & generate">
            <ul className="space-y-2 text-sm">
              <Row k="Goal" v={GOALS.find((g) => g.value === d.goal)?.label} />
              <Row k="Gender / Age" v={`${d.gender} · ${d.age}y`} />
              <Row k="Height / Weight" v={`${d.heightCm} cm · ${d.currentWeightKg} kg`} />
              <Row k="Activity" v={d.activityLevel} />
              <Row k="Experience" v={d.experience} />
              <Row k="Training days" v={`${d.daysPerWeek}/week`} />
              <Row k="Equipment" v={d.equipment} />
              <Row k="Diet" v={d.dietType} />
              <Row k="Conditions" v={(d.conditions ?? []).length ? d.conditions.join(", ") : "None"} />
            </ul>
            <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
              These targets are general guidance, not medical advice. Consult a professional, especially with a health condition.
            </p>
          </Section>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* nav */}
      <div className="mt-6 flex items-center gap-3">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="btn-ghost">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={next} className="btn-primary ml-auto">Next <ArrowRight className="h-4 w-4" /></button>
        ) : (
          <button onClick={submit} disabled={submitting} className="btn-primary ml-auto">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Generate my plan
          </button>
        )}
      </div>

      {/* Medical acknowledgment modal */}
      {showMedModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-slate-900">
            <h3 className="text-lg font-bold">Please read before continuing</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              You selected a condition (such as diabetes, high blood pressure, a heart condition, or
              pregnancy) that needs care. FitTrack provides <strong>general guidance only — not
              medical advice</strong>. Please get clearance from your doctor before starting, and
              share your plan with them.
            </p>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={!!d.medicalAck} onChange={(e) => set({ medicalAck: e.target.checked })} />
              I understand this is not medical advice and I will consult a professional.
            </label>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowMedModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button
                disabled={!d.medicalAck}
                onClick={() => { setShowMedModal(false); setStep((s) => s + 1); }}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">{title}</h1>
      {children}
    </div>
  );
}
function Card({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" : "border-slate-200 hover:border-slate-300 dark:border-slate-800"}`}>
      {children}
    </button>
  );
}
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${active ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "border-slate-200 hover:border-slate-300 dark:border-slate-800"}`}>
      {children}
    </button>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><label className="label">{label}</label>{children}</div>);
}
function Row({ k, v }: { k: string; v?: string }) {
  return (<li className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800"><span className="text-slate-500">{k}</span><span className="font-medium capitalize">{v}</span></li>);
}
