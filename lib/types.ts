// Shared domain types used across the app and the Plan Engine.

export type Goal =
  | "lose_weight"
  | "gain_weight"
  | "build_muscle"
  | "recomp"
  | "maintain";

export type Gender = "male" | "female" | "other" | "prefer_not";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very"
  | "athlete";

export type Experience = "beginner" | "returning" | "intermediate" | "advanced";

export type Equipment = "full_gym" | "home_dumbbells" | "bodyweight";

export type DietType = "non_veg" | "vegetarian" | "vegan" | "eggetarian";

export type SplitType =
  | "full_body"
  | "upper_lower"
  | "ppl_ul"
  | "bro_split"
  | "ppl_x2";

// Medical conditions a user can declare during onboarding.
export type Condition =
  | "ibs"
  | "gerd"
  | "diabetes_t2"
  | "diabetes_t1"
  | "hypertension"
  | "high_cholesterol"
  | "pcos"
  | "hypothyroidism"
  | "lactose_intolerance"
  | "celiac"
  | "knee_joint"
  | "lower_back"
  | "asthma"
  | "heart"
  | "pregnant"
  | "none";

// Conditions that force a medical-acknowledgment gate + conservative defaults.
export const SERIOUS_CONDITIONS: Condition[] = [
  "diabetes_t1",
  "diabetes_t2",
  "hypertension",
  "heart",
  "pregnant",
];

export interface OnboardingInput {
  gender: Gender;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg?: number | null;
  goal: Goal;
  activityLevel: ActivityLevel;
  experience: Experience;
  daysPerWeek: 3 | 4 | 5 | 6;
  equipment: Equipment;
  dietType: DietType;
  allergies: string[];
  conditions: Condition[];
}

export interface GeneratedPlan {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  water: number; // litres
  split: SplitType;
  splitLabel: string;
  bmr: number;
  tdee: number;
  bmi: number;
  stepTarget?: number; // for fat-loss goals
  conditionFlags: ConditionFlags;
  notes: string[]; // safety / informational notes shown on the plan page
}

// Aggregated, app-wide flags derived from declared conditions.
// Used to tag foods/exercises and surface tips. Informational, NOT prescriptive.
export interface ConditionFlags {
  avoidFoodTags: string[]; // food tags to warn about, e.g. 'high_fodmap', 'dairy'
  exerciseCautions: string[]; // human-readable training cautions
  requiresDoctorClearance: boolean;
  pregnancy: boolean;
  tips: string[]; // daily tips surfaced in the UI
  substituteHighImpact: boolean; // swap squats/jumps for joint-friendly variants
  substituteSpinalLoad: boolean; // swap heavy axial-load lifts
  conservativeIntensity: boolean;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: "user" | "admin";
  plan_tier: "free" | "premium";
  gender: Gender | null;
  age: number | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  goal: Goal | null;
  activity_level: ActivityLevel | null;
  experience: Experience | null;
  days_per_week: number | null;
  equipment: Equipment | null;
  diet_type: DietType | null;
  allergies: string[] | null;
  conditions: Condition[] | null;
  medical_ack: boolean;
  target_calories: number | null;
  target_protein: number | null;
  target_carbs: number | null;
  target_fat: number | null;
  target_water_l: number | null;
  active_split: SplitType | null;
  onboarding_complete: boolean;
  suspended: boolean;
  created_at: string;
}

export interface FoodItem {
  id: string;
  owner_id: string | null;
  name: string;
  serving_label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_slot: string;
  tags: string[];
}
