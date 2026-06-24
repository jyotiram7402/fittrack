// Helpers for the free-exercise-db dataset stored at /public/data/exercises.json.
import type { SplitType } from "./types";
export type { SplitType };

// Image base; each exercise image path is relative to this prefix.
export const EXERCISE_IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

export interface Exercise {
  id: string;
  name: string;
  force: string | null;
  level: "beginner" | "intermediate" | "expert";
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

export function imageUrl(path: string): string {
  return EXERCISE_IMAGE_BASE + path;
}

// Map our onboarding equipment choice to dataset equipment values to filter by.
export function allowedEquipment(equip: string | null | undefined): string[] | null {
  switch (equip) {
    case "bodyweight":
      return ["body only", "bands"];
    case "home_dumbbells":
      return ["dumbbell", "body only", "bands", "kettlebells"];
    case "full_gym":
    default:
      return null; // no restriction
  }
}

export function filterExercises(
  all: Exercise[],
  opts: {
    muscle?: string;
    equipment?: string | null;
    level?: string;
    search?: string;
  }
): Exercise[] {
  const allowed = allowedEquipment(opts.equipment);
  const q = opts.search?.toLowerCase().trim();
  return all.filter((e) => {
    if (opts.muscle && !e.primaryMuscles.includes(opts.muscle) && !e.secondaryMuscles.includes(opts.muscle))
      return false;
    if (allowed && e.equipment && !allowed.includes(e.equipment)) return false;
    if (opts.level && e.level !== opts.level) return false;
    if (q && !e.name.toLowerCase().includes(q)) return false;
    return true;
  });
}

// --- Split day templates --------------------------------------------------
// Each day type lists the muscle groups to target. The workout page picks
// concrete exercises from the dataset filtered by the user's equipment/level.
export interface SplitDay {
  label: string;
  muscles: string[]; // dataset muscle keys
  rest?: boolean;
}

export const SPLIT_TEMPLATES: Record<SplitType, SplitDay[]> = {
  full_body: [
    { label: "Full Body A", muscles: ["quadriceps", "chest", "lats", "shoulders", "abdominals"] },
    { label: "Rest", muscles: [], rest: true },
    { label: "Full Body B", muscles: ["hamstrings", "chest", "middle back", "biceps", "triceps"] },
    { label: "Rest", muscles: [], rest: true },
    { label: "Full Body C", muscles: ["glutes", "shoulders", "lats", "calves", "abdominals"] },
    { label: "Rest", muscles: [], rest: true },
    { label: "Rest", muscles: [], rest: true },
  ],
  upper_lower: [
    { label: "Upper", muscles: ["chest", "lats", "shoulders", "biceps", "triceps"] },
    { label: "Lower", muscles: ["quadriceps", "hamstrings", "glutes", "calves"] },
    { label: "Rest", muscles: [], rest: true },
    { label: "Upper", muscles: ["chest", "middle back", "shoulders", "biceps", "triceps"] },
    { label: "Lower", muscles: ["quadriceps", "hamstrings", "glutes", "abdominals"] },
    { label: "Rest", muscles: [], rest: true },
    { label: "Rest", muscles: [], rest: true },
  ],
  ppl_ul: [
    { label: "Push", muscles: ["chest", "shoulders", "triceps"] },
    { label: "Pull", muscles: ["lats", "middle back", "biceps"] },
    { label: "Legs", muscles: ["quadriceps", "hamstrings", "glutes", "calves"] },
    { label: "Upper", muscles: ["chest", "lats", "shoulders", "biceps", "triceps"] },
    { label: "Lower", muscles: ["quadriceps", "hamstrings", "glutes", "abdominals"] },
    { label: "Rest", muscles: [], rest: true },
    { label: "Rest", muscles: [], rest: true },
  ],
  bro_split: [
    { label: "Chest", muscles: ["chest"] },
    { label: "Back", muscles: ["lats", "middle back"] },
    { label: "Shoulders", muscles: ["shoulders"] },
    { label: "Legs", muscles: ["quadriceps", "hamstrings", "glutes", "calves"] },
    { label: "Arms", muscles: ["biceps", "triceps"] },
    { label: "Rest", muscles: [], rest: true },
    { label: "Rest", muscles: [], rest: true },
  ],
  ppl_x2: [
    { label: "Push", muscles: ["chest", "shoulders", "triceps"] },
    { label: "Pull", muscles: ["lats", "middle back", "biceps"] },
    { label: "Legs", muscles: ["quadriceps", "hamstrings", "glutes", "calves"] },
    { label: "Push", muscles: ["chest", "shoulders", "triceps"] },
    { label: "Pull", muscles: ["lats", "middle back", "biceps"] },
    { label: "Legs", muscles: ["quadriceps", "hamstrings", "glutes", "calves"] },
    { label: "Rest", muscles: [], rest: true },
  ],
};

// Which split day is "today" (0 = Sunday … 6 = Saturday → index into the 7-day template).
export function todaysSplitDay(split: SplitType, date = new Date()): { index: number; day: SplitDay } {
  const template = SPLIT_TEMPLATES[split] ?? SPLIT_TEMPLATES.full_body;
  const index = date.getDay(); // 0..6
  return { index, day: template[index] ?? template[0] };
}

// Default sets×reps by experience level.
export function defaultPrescription(level: string | null | undefined): { sets: number; reps: string } {
  switch (level) {
    case "beginner":
    case "returning":
      return { sets: 2, reps: "8–12" };
    case "advanced":
      return { sets: 4, reps: "6–12" };
    default:
      return { sets: 3, reps: "8–12" };
  }
}
