"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Droplets, Minus, Plus, X } from "lucide-react";
import { MacroRing } from "@/components/MacroRing";
import { TAG_LABELS, MEAL_SLOTS } from "@/lib/constants";
import { INDIAN_FOODS, PORTIONS, type BundledFood, type Slot } from "@/lib/indianFoods";
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

// Unified shape the picker works with (bundled foods + DB foods).
interface PickerFood {
  key: string;
  foodItemId?: string; // present only for DB rows
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  slot: string;
  tags: string[];
}

export function DietTracker({ date, initialLogs, initialWater, foods, avoidTags, targets }: Props) {
  const router = useRouter();
  const [logs, setLogs] = useState<DietLogRow[]>(initialLogs);
  const [water, setWater] = useState(initialWater);
  const [showAdd, setShowAdd] = useState<Slot | null>(null);

  // Merge DB foods (personal + global) with the bundled Indian food DB.
  const pickerFoods = useMemo<PickerFood[]>(() => {
    const db: PickerFood[] = foods.map((f) => ({
      key: `db_${f.id}`,
      foodItemId: f.id,
      name: f.name,
      serving: f.serving_label,
      calories: f.calories,
      protein: Number(f.protein),
      carbs: Number(f.carbs),
      fat: Number(f.fat),
      slot: f.meal_slot,
      tags: f.tags ?? [],
    }));
    const dbNames = new Set(db.map((f) => f.name.toLowerCase()));
    const bundled: PickerFood[] = INDIAN_FOODS.filter((f) => !dbNames.has(f.name.toLowerCase())).map(
      (f: BundledFood) => ({
        key: f.id,
        name: f.name,
        serving: f.serving,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        slot: f.slot,
        tags: f.tags,
      })
    );
    return [...db, ...bundled].sort((a, b) => a.name.localeCompare(b.name));
  }, [foods]);

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
      setLogs((prev) => prev.map((l) => (l.id === row.id ? { ...l, checked: !next } : l))); // rollback
    }
  }

  // Add a picked food (with portion multiplier) → optimistic checked row.
  async function addFood(f: PickerFood, mult: number, slot: string) {
    const name = mult === 1 ? f.name : `${f.name} (×${mult})`;
    const scaled = {
      name,
      calories: Math.round(f.calories * mult),
      protein: Math.round(f.protein * mult * 10) / 10,
      carbs: Math.round(f.carbs * mult * 10) / 10,
      fat: Math.round(f.fat * mult * 10) / 10,
      meal_slot: slot,
    };
    const optimistic: DietLogRow = {
      id: `tmp-${Date.now()}`,
      food_item_id: f.foodItemId ?? null,
      food_name: scaled.name,
      calories: scaled.calories,
      protein: scaled.protein,
      carbs: scaled.carbs,
      fat: scaled.fat,
      meal_slot: slot,
      checked: true,
    };
    setLogs((prev) => [...prev, optimistic]);
    setShowAdd(null);
    await toggleDietLog({ foodItemId: f.foodItemId, date, checked: true, food: scaled });
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
        <button onClick={() => goDate(-1)} className="btn-ghost !p-2" aria-label="Previous day"><ChevronLeft className="h-5 w-5" /></button>
        <h1 className="text-lg font-bold">{format(parseISO(date), "EEE, d MMM")}</h1>
        <button onClick={() => goDate(1)} className="btn-ghost !p-2" aria-label="Next day"><ChevronRight className="h-5 w-5" /></button>
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
          <button onClick={() => changeWater(-0.25)} className="btn-ghost flex-1" aria-label="Remove 250ml"><Minus className="h-4 w-4" /></button>
          <button onClick={() => changeWater(0.25)} className="btn-primary flex-[2]"><Plus className="h-4 w-4" /> 250 ml</button>
        </div>
      </div>

      {/* meals */}
      {MEAL_SLOTS.map((slot) => (
        <section key={slot} className="card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold capitalize">{slot}</h2>
            <button onClick={() => setShowAdd(slot as Slot)} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
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

      {/* add food sheet */}
      {showAdd && (
        <FoodPicker
          foods={pickerFoods}
          avoidTags={avoidTags}
          defaultSlot={showAdd}
          onClose={() => setShowAdd(null)}
          onPick={addFood}
        />
      )}
    </div>
  );
}

function FoodPicker({
  foods,
  avoidTags,
  defaultSlot,
  onClose,
  onPick,
}: {
  foods: PickerFood[];
  avoidTags: string[];
  defaultSlot: Slot;
  onClose: () => void;
  onPick: (f: PickerFood, mult: number, slot: string) => void;
}) {
  const [q, setQ] = useState("");
  const [slot, setSlot] = useState<string>(defaultSlot);
  const [selected, setSelected] = useState<PickerFood | null>(null);

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim();
    return foods
      .filter((f) => (query ? f.name.toLowerCase().includes(query) : f.slot === slot))
      .slice(0, 80);
  }, [foods, q, slot]);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 sm:items-center sm:justify-center" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-white dark:bg-slate-900 sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center gap-2 border-b border-slate-100 p-3 dark:border-slate-800">
          <input
            autoFocus
            className="input"
            placeholder="Search 100+ foods… (dal, roti, dosa…)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={onClose} className="btn-ghost !p-2.5" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        {/* slot chips (hidden while searching) */}
        {!q && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 pt-3">
            {MEAL_SLOTS.map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={`chip whitespace-nowrap capitalize ${slot === s ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* list */}
        <div className="flex-1 overflow-y-auto p-3">
          {filtered.map((f) => {
            const warn = f.tags.filter((t) => avoidTags.includes(t));
            const isSel = selected?.key === f.key;
            return (
              <div key={f.key} className={`rounded-xl ${isSel ? "bg-brand-50 dark:bg-brand-900/20" : ""}`}>
                <button
                  onClick={() => setSelected(isSel ? null : f)}
                  className="flex w-full items-center justify-between rounded-xl p-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{f.name}</div>
                    <div className="text-xs text-slate-500">
                      {f.serving} · {f.calories} kcal · P{f.protein} C{f.carbs} F{f.fat}
                    </div>
                    {warn.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {warn.map((t) => (
                          <span key={t} className="chip bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            ⚠️ {TAG_LABELS[t] ?? t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Plus className={`h-4 w-4 shrink-0 transition ${isSel ? "rotate-45 text-slate-400" : "text-brand-500"}`} />
                </button>

                {/* portion chooser */}
                {isSel && (
                  <div className="animate-fade-in px-2.5 pb-2.5">
                    <p className="mb-1.5 text-xs text-slate-500">How much? ({f.serving})</p>
                    <div className="grid grid-cols-4 gap-2">
                      {PORTIONS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => onPick(f, p.mult, slot)}
                          className="rounded-xl border border-brand-300 bg-white py-2 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:bg-slate-900 dark:text-brand-300 dark:hover:bg-brand-900/30"
                        >
                          {p.label}
                          <div className="text-[10px] font-normal text-slate-400">{Math.round(f.calories * p.mult)} kcal</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No matches — try “dal”, “roti”, “dosa”, “paneer”…</p>
          )}
        </div>
      </div>
    </div>
  );
}
