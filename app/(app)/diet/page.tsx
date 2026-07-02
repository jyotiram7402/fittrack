import { requireProfile } from "@/lib/auth";
import { getDietLogs, getGlobalFoods, getWater, todayStr } from "@/lib/queries";
import { DietTracker } from "@/components/diet/DietTracker";
import { buildConditionFlags } from "@/lib/planEngine";
import type { Condition } from "@/lib/types";

export const metadata = { title: "Diet" };

export default async function DietPage({ searchParams }: { searchParams: { date?: string } }) {
  const profile = await requireProfile();
  const date = searchParams.date || todayStr();
  const [logs, foods, water] = await Promise.all([
    getDietLogs(profile.id, date),
    getGlobalFoods(profile.id),
    getWater(profile.id, date),
  ]);
  const flags = buildConditionFlags((profile.conditions ?? ["none"]) as Condition[]);

  return (
    <DietTracker
      key={date}
      date={date}
      initialLogs={logs}
      foods={foods}
      initialWater={water}
      avoidTags={flags.avoidFoodTags}
      targets={{
        calories: profile.target_calories ?? 0,
        protein: profile.target_protein ?? 0,
        carbs: profile.target_carbs ?? 0,
        fat: profile.target_fat ?? 0,
        water: profile.target_water_l ?? 0,
      }}
    />
  );
}
