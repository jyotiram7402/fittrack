import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { generatePlan } from "@/lib/planEngine";
import { SPLIT_TEMPLATES } from "@/lib/exercises";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { GOAL_LABELS } from "@/lib/constants";
import type { OnboardingInput, SplitType } from "@/lib/types";
import { Droplets, Dumbbell, Flame, Info } from "lucide-react";

export const metadata = { title: "My Plan" };

export default async function PlanPage() {
  const p = await requireProfile();

  // Recompute live from stored inputs so the page always reflects current formulas.
  const input: OnboardingInput = {
    gender: (p.gender ?? "prefer_not") as any,
    age: p.age ?? 30,
    heightCm: p.height_cm ?? 170,
    currentWeightKg: p.current_weight_kg ?? 70,
    targetWeightKg: p.target_weight_kg,
    goal: (p.goal ?? "maintain") as any,
    activityLevel: (p.activity_level ?? "moderate") as any,
    experience: (p.experience ?? "beginner") as any,
    daysPerWeek: (p.days_per_week ?? 3) as 3 | 4 | 5 | 6,
    equipment: (p.equipment ?? "full_gym") as any,
    dietType: (p.diet_type ?? "non_veg") as any,
    allergies: p.allergies ?? [],
    conditions: (p.conditions ?? ["none"]) as any,
  };
  const plan = generatePlan(input);
  const template = SPLIT_TEMPLATES[plan.split as SplitType];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your plan</h1>
        <Link href="/settings" className="btn-ghost text-sm">Edit inputs / recalculate</Link>
      </div>

      <div className="card">
        <p className="text-sm text-slate-500">Goal</p>
        <p className="text-xl font-bold">{GOAL_LABELS[input.goal]}</p>
        <p className="mt-1 text-xs text-slate-500">BMR {plan.bmr} · TDEE {plan.tdee} · BMI {plan.bmi}</p>
      </div>

      {/* Targets */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile icon={<Flame className="h-5 w-5 text-amber-500" />} label="Calories" value={`${plan.calories}`} unit="kcal" />
        <Tile label="Protein" value={`${plan.protein}`} unit="g" />
        <Tile label="Carbs" value={`${plan.carbs}`} unit="g" />
        <Tile label="Fat" value={`${plan.fat}`} unit="g" />
        <Tile icon={<Droplets className="h-5 w-5 text-cyan-500" />} label="Water" value={`${plan.water}`} unit="L" />
        {plan.stepTarget && <Tile label="Steps/day" value={`${plan.stepTarget.toLocaleString()}`} unit="" />}
      </div>

      {/* The math — transparency builds trust */}
      <section className="card">
        <h2 className="flex items-center gap-2 font-semibold">🧮 How we calculated this</h2>
        <p className="mt-1 text-xs text-slate-500">
          Standard, published formulas — no black box. Your numbers:
        </p>
        <div className="mt-3 space-y-3 text-sm">
          <MathStep n={1} title="BMR — Mifflin–St Jeor equation" note="Calories your body burns at complete rest.">
            10 × {input.currentWeightKg} kg + 6.25 × {input.heightCm} cm − 5 × {input.age} yr {input.gender === "male" ? "+ 5" : input.gender === "female" ? "− 161" : "− 78"} = <b>{plan.bmr} kcal</b>
          </MathStep>
          <MathStep n={2} title="TDEE — total daily burn" note="BMR × your activity level multiplier.">
            {plan.bmr} × activity factor = <b>{plan.tdee} kcal</b>
          </MathStep>
          <MathStep n={3} title="Goal adjustment" note="A safe surplus/deficit for your goal — never below safety floors.">
            {plan.tdee} kcal adjusted for “{GOAL_LABELS[input.goal]}” = <b>{plan.calories} kcal/day</b>
          </MathStep>
          <MathStep n={4} title="Protein" note="Set per kg of body weight for your goal (muscle preservation & growth).">
            {input.currentWeightKg} kg × goal factor = <b>{plan.protein} g</b>
          </MathStep>
          <MathStep n={5} title="Fat & carbs" note="Fat ≥ 0.8 g/kg for hormones; carbs fill the remaining calories.">
            Fat <b>{plan.fat} g</b> · remaining {plan.calories} − ({plan.protein}×4 + {plan.fat}×9) → carbs <b>{plan.carbs} g</b>
          </MathStep>
          <MathStep n={6} title="Water" note="0.033 L per kg of body weight, minimum 2 L.">
            {input.currentWeightKg} × 0.033 ≈ <b>{plan.water} L/day</b>
          </MathStep>
        </div>
      </section>

      {/* Split */}
      <section className="card">
        <h2 className="flex items-center gap-2 font-semibold"><Dumbbell className="h-5 w-5 text-brand-500" /> {plan.splitLabel}</h2>
        <div className="mt-3 grid gap-2">
          {template.map((d, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50">
              <span className="font-medium">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i]} · {d.label}</span>
              <span className="text-xs capitalize text-slate-500">{d.rest ? "Recovery" : d.muscles.join(", ")}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Condition flags / tips */}
      {plan.conditionFlags.tips.length > 0 && (
        <section className="card">
          <h2 className="mb-2 flex items-center gap-2 font-semibold"><Info className="h-5 w-5 text-brand-500" /> Tips for your conditions</h2>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {plan.conditionFlags.tips.map((t) => <li key={t}>• {t}</li>)}
          </ul>
          {plan.conditionFlags.exerciseCautions.length > 0 && (
            <>
              <p className="mt-3 text-sm font-semibold">Training notes</p>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {plan.conditionFlags.exerciseCautions.map((c) => <li key={c}>• {c}</li>)}
              </ul>
            </>
          )}
        </section>
      )}

      {/* Notes */}
      {plan.notes.length > 0 && (
        <section className="card">
          <h2 className="mb-2 font-semibold">Notes</h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {plan.notes.map((n, i) => <li key={i}>• {n}</li>)}
          </ul>
        </section>
      )}

      <MedicalDisclaimer />
    </div>
  );
}

function MathStep({ n, title, note, children }: { n: number; title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
        {n}
      </div>
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="rounded-lg bg-slate-50 px-2 py-1 font-mono text-xs dark:bg-slate-800/60">{children}</p>
        <p className="mt-0.5 text-xs text-slate-500">{note}</p>
      </div>
    </div>
  );
}

function Tile({ icon, label, value, unit }: { icon?: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="card">
      {icon}
      <p className="mt-1 text-2xl font-bold">{value}<span className="text-sm font-normal text-slate-400"> {unit}</span></p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
