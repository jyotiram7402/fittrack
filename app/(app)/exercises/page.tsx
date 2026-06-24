import { ExerciseLibrary } from "@/components/exercises/ExerciseLibrary";
import { requireProfile } from "@/lib/auth";

export const metadata = { title: "Exercises" };

export default async function ExercisesPage() {
  const profile = await requireProfile();
  return <ExerciseLibrary equipment={profile.equipment ?? "full_gym"} />;
}
