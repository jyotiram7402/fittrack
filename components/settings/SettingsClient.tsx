"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteAccount, deletePersonalFood, savePersonalFood } from "@/app/actions";
import { MEAL_SLOTS } from "@/lib/constants";
import type { FoodItem } from "@/lib/types";

export function SettingsClient({ foods }: { foods: FoodItem[]; email: string }) {
  const router = useRouter();
  const [savingFood, setSavingFood] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function addFood(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSavingFood(true);
    const res = await savePersonalFood({
      name: f.get("name"),
      serving_label: f.get("serving") || "1 serving",
      calories: f.get("calories"),
      protein: f.get("protein"),
      carbs: f.get("carbs"),
      fat: f.get("fat"),
      meal_slot: f.get("slot"),
      tags: [],
    });
    setSavingFood(false);
    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwMsg(null);
    const pw = String(new FormData(e.currentTarget).get("password"));
    if (pw.length < 8) return setPwMsg("Password must be at least 8 characters.");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwMsg(error ? error.message : "Password updated ✓");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <>
      {/* Personal food library */}
      <section className="card">
        <h2 className="font-semibold">Your food library</h2>
        <p className="mb-3 mt-1 text-sm text-slate-500">Add custom foods you eat often.</p>
        <form onSubmit={addFood} className="grid grid-cols-2 gap-2">
          <input name="name" placeholder="Food name" className="input col-span-2" required />
          <input name="serving" placeholder="Serving (e.g. 1 cup)" className="input col-span-2" />
          <input name="calories" type="number" placeholder="kcal" className="input" required />
          <select name="slot" className="input">
            {MEAL_SLOTS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <input name="protein" type="number" step="0.1" placeholder="protein g" className="input" />
          <input name="carbs" type="number" step="0.1" placeholder="carbs g" className="input" />
          <input name="fat" type="number" step="0.1" placeholder="fat g" className="input" />
          <button className="btn-primary col-span-2" disabled={savingFood}>{savingFood && <Loader2 className="h-4 w-4 animate-spin" />} Add food</button>
        </form>

        <div className="mt-4 space-y-1">
          {foods.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50">
              <span>{f.name} <span className="text-xs text-slate-500">· {f.calories} kcal</span></span>
              <button onClick={async () => { await deletePersonalFood(f.id); router.refresh(); }} className="text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {foods.length === 0 && <p className="text-sm text-slate-400">No custom foods yet.</p>}
        </div>
      </section>

      {/* Password */}
      <section className="card">
        <h2 className="font-semibold">Change password</h2>
        <form onSubmit={changePassword} className="mt-3 flex gap-2">
          <input name="password" type="password" placeholder="New password" className="input" minLength={8} autoComplete="new-password" />
          <button className="btn-ghost shrink-0">Update</button>
        </form>
        {pwMsg && <p className="mt-2 text-sm text-slate-500">{pwMsg}</p>}
      </section>

      {/* Danger zone */}
      <section className="card border-red-300 dark:border-red-900/50">
        <h2 className="font-semibold text-red-600">Delete account</h2>
        <p className="mt-1 text-sm text-slate-500">Permanently removes your account and all data. This cannot be undone.</p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="btn-ghost mt-3 text-red-600">Delete my account</button>
        ) : (
          <form action={deleteAccount} className="mt-3 flex gap-2">
            <button className="btn bg-red-600 text-white hover:bg-red-700">Yes, delete everything</button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="btn-ghost">Cancel</button>
          </form>
        )}
      </section>
    </>
  );
}
