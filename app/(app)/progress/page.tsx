import { requireProfile } from "@/lib/auth";
import { getDietAdherence, getWeightLogs, getWorkoutLogs } from "@/lib/queries";
import { ProgressView } from "@/components/progress/ProgressView";

export const metadata = { title: "Progress" };

export default async function ProgressPage() {
  const profile = await requireProfile();
  const [weights, workouts, diet] = await Promise.all([
    getWeightLogs(profile.id, 365),
    getWorkoutLogs(profile.id, 90),
    getDietAdherence(profile.id, 60),
  ]);

  // Aggregate workout volume per day (sum reps × weight).
  const volumeByDate = new Map<string, number>();
  for (const w of workouts as any[]) {
    const vol = (Number(w.reps) || 0) * (Number(w.weight_kg) || 0);
    volumeByDate.set(w.log_date, (volumeByDate.get(w.log_date) ?? 0) + vol);
  }
  const workoutDates = new Set((workouts as any[]).map((w) => w.log_date));

  // Diet adherence: avg calories/protein per logged day.
  const dietByDate = new Map<string, { cals: number; protein: number }>();
  for (const r of diet as any[]) {
    const e = dietByDate.get(r.log_date) ?? { cals: 0, protein: 0 };
    e.cals += Number(r.calories) || 0;
    e.protein += Number(r.protein) || 0;
    dietByDate.set(r.log_date, e);
  }

  return (
    <ProgressView
      weights={(weights as any[]).map((w) => ({ date: w.log_date, weight: Number(w.weight_kg), waist: w.waist_cm ? Number(w.waist_cm) : null }))}
      volume={[...volumeByDate.entries()].map(([date, v]) => ({ date, volume: Math.round(v) })).sort((a, b) => a.date.localeCompare(b.date))}
      diet={[...dietByDate.entries()].map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date))}
      workoutDays={workoutDates.size}
      targets={{ calories: profile.target_calories ?? 0, protein: profile.target_protein ?? 0 }}
    />
  );
}
