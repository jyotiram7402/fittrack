import Link from "next/link";
import { format } from "date-fns";
import { requireProfile } from "@/lib/auth";
import { getDietLogs, getWater, getWeightLogs, sumChecked, todayStr } from "@/lib/queries";
import { MacroRing } from "@/components/MacroRing";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { buildConditionFlags } from "@/lib/planEngine";
import { todaysSplitDay } from "@/lib/exercises";
import { WeightSparkline } from "@/components/WeightSparkline";
import { Dumbbell, Droplets, Flame } from "lucide-react";
import type { Condition, SplitType } from "@/lib/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireProfile();
  const date = todayStr();
  const [logs, water, weights] = await Promise.all([
    getDietLogs(profile.id, date),
    getWater(profile.id, date),
    getWeightLogs(profile.id, 90),
  ]);

  const totals = sumChecked(logs);
  const flags = buildConditionFlags((profile.conditions ?? ["none"]) as Condition[]);
  const today = todaysSplitDay((profile.active_split ?? "full_body") as SplitType);
  const firstName = profile.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">{format(new Date(), "EEEE, d MMMM")}</p>
        <h1 className="text-2xl font-bold">Hi {firstName} 👋</h1>
      </div>

      {/* Macro rings */}
      <section className="card">
        <h2 className="mb-3 text-sm font-semibold text-slate-500">Today's targets</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          <MacroRing label="Calories" value={totals.calories} target={profile.target_calories ?? 0} unit="" color="#16bb5e" />
          <MacroRing label="Protein" value={totals.protein} target={profile.target_protein ?? 0} color="#3b82f6" />
          <MacroRing label="Carbs" value={totals.carbs} target={profile.target_carbs ?? 0} color="#f59e0b" />
          <MacroRing label="Fat" value={totals.fat} target={profile.target_fat ?? 0} color="#ef4444" />
          <MacroRing label="Water" value={water} target={profile.target_water_l ?? 0} unit="L" color="#06b6d4" />
        </div>
        <Link href="/diet" className="btn-ghost mt-3 w-full">Log food & water</Link>
      </section>

      {/* Today's workout */}
      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold"><Dumbbell className="h-5 w-5 text-brand-500" /> Today's workout</h2>
          <Link href="/workout" className="text-sm text-brand-600">Open →</Link>
        </div>
        <p className="mt-2 text-2xl font-bold">{today.day.rest ? "Rest day 😴" : today.day.label}</p>
        {!today.day.rest && <p className="text-sm text-slate-500">Targets: {today.day.muscles.join(", ")}</p>}
      </section>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <Flame className="h-5 w-5 text-amber-500" />
          <p className="mt-2 text-2xl font-bold">{Math.round(totals.calories)}</p>
          <p className="text-xs text-slate-500">kcal eaten today</p>
        </div>
        <div className="card">
          <Droplets className="h-5 w-5 text-cyan-500" />
          <p className="mt-2 text-2xl font-bold">{water.toFixed(2)} L</p>
          <p className="text-xs text-slate-500">water today</p>
        </div>
      </div>

      {/* Weight sparkline */}
      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Weight trend</h2>
          <Link href="/progress" className="text-sm text-brand-600">Log weight →</Link>
        </div>
        {weights.length ? (
          <WeightSparkline data={weights.map((w) => ({ date: w.log_date, weight: Number(w.weight_kg) }))} />
        ) : (
          <p className="mt-2 text-sm text-slate-500">No weigh-ins yet. Log your first on the Progress page.</p>
        )}
      </section>

      {/* Condition tips */}
      {flags.tips.length > 0 && (
        <section className="card">
          <h2 className="mb-2 font-semibold">Tips for you today</h2>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {flags.tips.map((t) => (<li key={t}>• {t}</li>))}
          </ul>
        </section>
      )}

      <MedicalDisclaimer />
    </div>
  );
}
