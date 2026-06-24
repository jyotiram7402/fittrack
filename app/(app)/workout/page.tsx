import { requireProfile } from "@/lib/auth";
import { todaysSplitDay, SPLIT_TEMPLATES } from "@/lib/exercises";
import { WorkoutSession } from "@/components/workout/WorkoutSession";
import { buildConditionFlags } from "@/lib/planEngine";
import { todayStr } from "@/lib/queries";
import type { Condition, SplitType } from "@/lib/types";

export const metadata = { title: "Workout" };

export default async function WorkoutPage() {
  const profile = await requireProfile();
  const split = (profile.active_split ?? "full_body") as SplitType;
  const today = todaysSplitDay(split);
  const flags = buildConditionFlags((profile.conditions ?? ["none"]) as Condition[]);

  return (
    <WorkoutSession
      date={todayStr()}
      dayLabel={today.day.label}
      isRest={!!today.day.rest}
      muscles={today.day.muscles}
      equipment={profile.equipment ?? "full_gym"}
      experience={profile.experience ?? "intermediate"}
      weekPlan={SPLIT_TEMPLATES[split].map((d) => d.label)}
      cautions={flags.exerciseCautions}
      substituteHighImpact={flags.substituteHighImpact}
      substituteSpinalLoad={flags.substituteSpinalLoad}
    />
  );
}
