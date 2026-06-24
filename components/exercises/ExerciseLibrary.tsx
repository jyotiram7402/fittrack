"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { ExerciseAnimation } from "@/components/ExerciseAnimation";
import { filterExercises, type Exercise } from "@/lib/exercises";

const MUSCLES = [
  "chest", "lats", "middle back", "shoulders", "biceps", "triceps",
  "quadriceps", "hamstrings", "glutes", "calves", "abdominals",
];

export function ExerciseLibrary({ equipment }: { equipment: string }) {
  const [all, setAll] = useState<Exercise[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState<string>("");
  const [respectEquip, setRespectEquip] = useState(true);
  const [selected, setSelected] = useState<Exercise | null>(null);

  useEffect(() => {
    fetch("/data/exercises.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setAll)
      .catch(() => setError(true));
  }, []);

  const results = useMemo(() => {
    if (!all) return [];
    return filterExercises(all, {
      search,
      muscle: muscle || undefined,
      equipment: respectEquip ? equipment : null,
    }).slice(0, 120);
  }, [all, search, muscle, respectEquip, equipment]);

  if (error)
    return (
      <div className="card text-sm text-slate-500">
        Exercise data not found. Add <code>/public/data/exercises.json</code> (see README), then redeploy.
      </div>
    );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Exercise library</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search exercises…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button onClick={() => setMuscle("")} className={`chip whitespace-nowrap ${!muscle ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>All</button>
        {MUSCLES.map((m) => (
          <button key={m} onClick={() => setMuscle(m)} className={`chip whitespace-nowrap capitalize ${muscle === m ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>{m}</button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-500">
        <input type="checkbox" checked={respectEquip} onChange={(e) => setRespectEquip(e.target.checked)} className="accent-brand-500" />
        Only show exercises for my equipment ({equipment.replace("_", " ")})
      </label>

      {!all && <div className="card flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {results.map((e) => (
          <button key={e.id} onClick={() => setSelected(e)} className="card text-left">
            <ExerciseAnimation images={e.images} alt={e.name} className="aspect-square w-full" />
            <h3 className="mt-2 line-clamp-2 text-sm font-medium capitalize">{e.name}</h3>
            <p className="text-xs capitalize text-slate-500">{e.primaryMuscles[0]}</p>
          </button>
        ))}
      </div>
      {all && results.length === 0 && <p className="text-center text-sm text-slate-400">No exercises match.</p>}

      {selected && <ExerciseDetail exercise={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ExerciseDetail({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 sm:items-center sm:justify-center" onClick={onClose}>
      <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 dark:bg-slate-900 sm:max-w-md sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between">
          <h2 className="text-lg font-bold capitalize">{exercise.name}</h2>
          <button onClick={onClose} className="btn-ghost !p-2"><X className="h-5 w-5" /></button>
        </div>
        <ExerciseAnimation images={exercise.images} alt={exercise.name} className="aspect-video w-full" />
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="chip bg-slate-100 capitalize dark:bg-slate-800">{exercise.level}</span>
          <span className="chip bg-slate-100 capitalize dark:bg-slate-800">{exercise.equipment}</span>
          <span className="chip bg-slate-100 capitalize dark:bg-slate-800">{exercise.category}</span>
        </div>
        <p className="mt-3 text-sm font-semibold">Muscles</p>
        <p className="text-sm capitalize text-slate-500">{[...exercise.primaryMuscles, ...exercise.secondaryMuscles].join(", ")}</p>
        <p className="mt-3 text-sm font-semibold">Instructions</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
          {exercise.instructions.map((ins, i) => <li key={i}>{ins}</li>)}
        </ol>
      </div>
    </div>
  );
}
