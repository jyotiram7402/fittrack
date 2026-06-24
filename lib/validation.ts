import { z } from "zod";

export const onboardingSchema = z.object({
  goal: z.enum(["lose_weight", "gain_weight", "build_muscle", "recomp", "maintain"]),
  gender: z.enum(["male", "female", "other", "prefer_not"]),
  age: z.coerce.number().int().min(13, "Must be at least 13").max(100),
  heightCm: z.coerce.number().min(100).max(250),
  currentWeightKg: z.coerce.number().min(30).max(400),
  targetWeightKg: z.coerce.number().min(30).max(400).optional().nullable(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "very", "athlete"]),
  experience: z.enum(["beginner", "returning", "intermediate", "advanced"]),
  daysPerWeek: z.coerce.number().refine((n) => [3, 4, 5, 6].includes(n), "Pick 3–6 days"),
  equipment: z.enum(["full_gym", "home_dumbbells", "bodyweight"]),
  dietType: z.enum(["non_veg", "vegetarian", "vegan", "eggetarian"]),
  allergies: z.array(z.string().max(40)).max(30).default([]),
  conditions: z.array(z.string().max(40)).max(30).default([]),
  medicalAck: z.boolean().default(false),
});

export type OnboardingForm = z.infer<typeof onboardingSchema>;

export const signupSchema = z.object({
  fullName: z.string().min(1, "Required").max(80),
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Required"),
});

export const foodSchema = z.object({
  name: z.string().min(1).max(80),
  serving_label: z.string().max(40).default("1 serving"),
  calories: z.coerce.number().int().min(0).max(5000),
  protein: z.coerce.number().min(0).max(500),
  carbs: z.coerce.number().min(0).max(500),
  fat: z.coerce.number().min(0).max(500),
  meal_slot: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  tags: z.array(z.string().max(40)).default([]),
});

export const weightSchema = z.object({
  weight_kg: z.coerce.number().min(30).max(400),
  waist_cm: z.coerce.number().min(30).max(250).optional().nullable(),
  log_date: z.string(),
});

// Strip ASCII control chars from free-text before persisting.
export function sanitizeText(s: string, max = 200): string {
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) continue; // drop C0 controls + DEL
    out += ch;
  }
  return out.trim().slice(0, max);
}
