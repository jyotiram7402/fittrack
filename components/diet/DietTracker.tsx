"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Droplets, Minus, Plus } from "lucide-react";
import { MacroRing } from "@/components/MacroRing";
import { TAG_LABELS, MEAL_SLOTS } from "@/lib/constants";
import { logWater, toggleDietLog } from "@/app/actions";
import type { FoodItem } from "@/lib/types";
import type { DietLogRow } from "@/lib/queries";

interface Props {
  date: string;
  initialLogs: DietLogRow[];
  initialWater: number;
  foods: FoodItem[];
  avoidTags: string[];
  targets: { calories: number; protein: number; carbs: number; fat: number; water: number };
}

export function DietTracker({ date, initialLogs, initialWater, foods, avoidTags, targets }: Props) {
  const router = useRouter();
  const [logs, setLogs] = useState<DietLogRow[]>(initialLogs);
  const [water, setWater] = useState(initialWater);
  const [showAdd, setShowAdd] = useState(false);

  const totals = useMemo(
    () =>
      logs
        .filter((l) => l.checked)
        .reduce(
          (a, l) => ({
            calories: a.calories + (l.calories || 0),
            protein: a.protein + Number(l.protein || 0),
            carbs: a.carbs + Number(l.carbs || 0),
            fat: a.fat + Number(l.fat || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        ),
    [logs]
  );

  function goDate(delta: number) {
    const d = format(addDays(parseISO(date), delta), "yyyy-MM-dd");
    router.push(`/diet?date=${d}`);
  }

  // Optimistic toggle of an existing log row.
  async function toggle(row: DietLogRow) {
    const next = !row.checked;
    setLogs((prev) => prev.map((l) => (l.id === row.id ? { ...l, checked: next } : l)));
    const res = await toggleDietLog({
      logId: row.id,
      date,
      checked: next,
      food: { name: row.food_name ?? "", calories: row.calories, protein: row.protein, carbs: row.carbs, fat: row.fat, meal_slot: row.meal_slot },
    });
    if (!res.ok) {
      // rollback
      setLogs((prev) => prev.map((l) => (l.id === row.id ? { ...l, checked: !next } : l)));
    }
  }

  // Add a food from the library → creates a checked log + optimistic row.
  async function addFood(f: FoodItem) {
    const tempId = `tmp-${Date.now()}`;
    const optimistic: DietLogRow = {
      id: tempId,
      food_item_id: f.id,
      food_name: f.name,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      meal_slot: f.meal_slot,
      checked: true,
    };
    setLogs((prev) => [...prev, optimistic]);
    setShowAdd(false);
    await toggleDietLog({
      foodItemId: f.id,
      date,
      checked: true,
      food: { name: f.name, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat, meal_slot: f.meal_slot },
    });
    router.refresh();
  }

  async function changeWater(delta: number) {
    const next = Math.max(0, Math.round((water + delta) * 100) / 100);
    setWater(next);
    await logWater(date, next);
  }

  const bySlot = (slot: string) => logs.filter((l) => l.meal_slot === slot);

  return (
    <div className="space-y-5">
      {/* date switcher */}
      <div className="flex items-center justify-between">
        <button onClick={() => goDate(-1)} className="btn-ghost !p-2"><ChevronLeft className="h-5 w-5" /></button>
        <h1 className="text-lg font-bold">{format(parseISO(date), "EEE, d MMM")}</h1>
        <button onClick={() => goDate(1)} className="btn-ghost !p-2"><ChevronRight className="h-5 w-5" /></button>
      </div>

      {/* live macros */}
      <div className="card grid grid-cols-4 gap-2">
        <MacroRing label="Cals" value={totals.calories} target={targets.calories} unit="" size={80} />
        <MacroRing label="Protein" value={totals.protein} target={targets.protein} color="#3b82f6" size={80} />
        <MacroRing label="Carbs" value={totals.carbs} target={targets.carbs} color="#f59e0b" size={80} />
        <MacroRing label="Fat" value={totals.fat} target={targets.fat} color="#ef4444" size={80} />
      </div>

      {/* water */}
      <div className="card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold"><Droplets className="h-5 w-5 text-cyan-500" /> Water</h2>
          <span className="text-sm text-slate-500">{water.toFixed(2)} / {targets.water} L</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => changeWater(-0.25)} className="btn-ghost flex-1"><Minus className="h-4 w-4" /></button>
          <button onClick={() => changeWater(0.25)} className="btn-primary flex-[2]"><Plus className="h-4 w-4" /> 250 ml</button>
        </div>
      </div>

      {/* meals */}
      {MEAL_SLOTS.map((slot) => (
        <section key={slot} className="card">
          <h2 className="mb-2 font-semibold capitalize">{slot}</h2>
          <div className="space-y-1">
            {bySlot(slot).length === 0 && <p className="text-sm text-slate-400">Nothing logged yet.</p>}
            {bySlot(slot).map((l) => (
              <label key={l.id} className="flex cursor-pointer items-center gap-3 rounded-lg py-1.5">
                <input type="checkbox" checked={l.checked} onChange={() => toggle(l)} className="h-5 w-5 accent-brand-500" />
                <span className={`flex-1 text-sm ${l.checked ? "" : "text-slate-400 line-through"}`}>{l.food_name}</span>
                <span className="text-xs text-slate-500">{l.calories} kcal</span>
              </label>
            ))}
          </div>
        </section>
      ))}

      <button onClick={() => setShowAdd(true)} className="btn-primary w-full"><Plus className="h-4 w-4" /> Add food</button>

      {/* add food sheet */}
      {showAdd && (
        <FoodPicker foods={foods} avoidTags={avoidTags} onClose={() => setShowAdd(false)} onPick={addFood} />
      )}
    </div>
  );
}

function FoodPicker({ foods, avoidTags, onClose, onPick }: { foods: FoodItem[]; avoidTags: string[]; onClose: () => void; onPick: (f: FoodItem) => void }) {
  const [q, setQ] = useState("");
  const filtered = foods.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center" onClick={onClose}>
      <div className="max-h-[75vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 dark:bg-slate-900 sm:max-w-md sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <input autoFocus className="input mb-3" placeholder="Search foods…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="space-y-1">
          {filtered.slice(0, 60).map((f) => {
            const warn = f.tags.filter((t) => avoidTags.includes(t));
            return (
              <button key={f.id} onClick={() => onPick(f)} className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800">
                <div>
                  <div className="text-sm font-medium">{f.name}</div>
                  <div className="text-xs text-slate-500">{f.serving_label} · {f.calories} kcal · P{f.protein} C{f.carbs} F{f.fat}</div>
                  {warn.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {warn.map((t) => (<span key={t} className="chip bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">⚠️ {TAG_LABELS[t] ?? t}</span>))}
                    </div>
                  )}
                </div>
                <Plus className="h-4 w-4 text-brand-500" />
              </button>
            );
          })}
          {filtered.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No matches. Add custom foods in Settings.</p>}
        </div>
      </div>
    </div>
  );
}
