import type {
  ActivityLevel,
  Condition,
  DietType,
  Equipment,
  Experience,
  Gender,
  Goal,
} from "./types";

export const GOALS: { value: Goal; label: string; desc: string; emoji: string }[] = [
  { value: "lose_weight", label: "Lose weight", desc: "Fat loss", emoji: "🔥" },
  { value: "gain_weight", label: "Gain weight", desc: "Add mass", emoji: "📈" },
  { value: "build_muscle", label: "Build muscle", desc: "Get stronger & bigger", emoji: "💪" },
  { value: "recomp", label: "Body recomposition", desc: "Lose fat + build muscle", emoji: "⚖️" },
  { value: "maintain", label: "Maintain", desc: "General fitness", emoji: "✨" },
];

export const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not", label: "Prefer not to say" },
];

export const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: "sedentary", label: "Sedentary", desc: "Desk job, little exercise" },
  { value: "light", label: "Lightly active", desc: "Light exercise 1–3 days/wk" },
  { value: "moderate", label: "Moderately active", desc: "Exercise 3–5 days/wk" },
  { value: "very", label: "Very active", desc: "Hard exercise 6–7 days/wk" },
  { value: "athlete", label: "Athlete / physical job", desc: "Twice-daily or physical work" },
];

export const EXPERIENCES: { value: Experience; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "returning", label: "Returning after a break" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const EQUIPMENT: { value: Equipment; label: string }[] = [
  { value: "full_gym", label: "Full gym" },
  { value: "home_dumbbells", label: "Home dumbbells only" },
  { value: "bodyweight", label: "Bodyweight only" },
];

export const DIET_TYPES: { value: DietType; label: string }[] = [
  { value: "non_veg", label: "Non-vegetarian" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "eggetarian", label: "Eggetarian" },
];

export const ALLERGY_OPTIONS = ["dairy", "nuts", "soy", "gluten", "shellfish", "eggs"];

export const CONDITIONS: { value: Condition; label: string; serious?: boolean }[] = [
  { value: "ibs", label: "IBS / sensitive gut" },
  { value: "gerd", label: "Acid reflux / GERD" },
  { value: "diabetes_t2", label: "Type 2 diabetes", serious: true },
  { value: "diabetes_t1", label: "Type 1 diabetes", serious: true },
  { value: "hypertension", label: "High blood pressure", serious: true },
  { value: "high_cholesterol", label: "High cholesterol" },
  { value: "pcos", label: "PCOS" },
  { value: "hypothyroidism", label: "Hypothyroidism" },
  { value: "lactose_intolerance", label: "Lactose intolerance" },
  { value: "celiac", label: "Gluten intolerance / Celiac" },
  { value: "knee_joint", label: "Knee / joint pain or injury" },
  { value: "lower_back", label: "Lower back pain or injury" },
  { value: "asthma", label: "Asthma" },
  { value: "heart", label: "Heart condition", serious: true },
  { value: "pregnant", label: "Currently pregnant or postpartum", serious: true },
];

export const GOAL_LABELS: Record<Goal, string> = Object.fromEntries(
  GOALS.map((g) => [g.value, g.label])
) as Record<Goal, string>;

// Human-readable labels for food/condition tags.
export const TAG_LABELS: Record<string, string> = {
  high_fodmap: "High-FODMAP",
  dairy: "Dairy",
  gluten: "Gluten",
  high_glycemic: "High-GI",
  sugary: "Sugary",
  high_sodium: "High-sodium",
  spicy: "Spicy",
  fried: "Fried",
  citrus: "Citrus",
  caffeine: "Caffeine",
  saturated_fat: "Saturated fat",
  processed: "Processed",
};

export const MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;
