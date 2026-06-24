"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase, createServiceClient } from "@/lib/supabase/server";
import { generatePlan } from "@/lib/planEngine";
import { onboardingSchema, foodSchema, weightSchema, sanitizeText } from "@/lib/validation";
import type { OnboardingInput } from "@/lib/types";

async function uid() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { user, supabase };
}

// --- Onboarding: validate, run plan engine, persist targets ---------------
export async function completeOnboarding(raw: unknown) {
  const { user, supabase } = await uid();
  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  const engineInput: OnboardingInput = {
    gender: d.gender,
    age: d.age,
    heightCm: d.heightCm,
    currentWeightKg: d.currentWeightKg,
    targetWeightKg: d.targetWeightKg ?? null,
    goal: d.goal,
    activityLevel: d.activityLevel,
    experience: d.experience,
    daysPerWeek: d.daysPerWeek as 3 | 4 | 5 | 6,
    equipment: d.equipment,
    dietType: d.dietType,
    allergies: d.allergies,
    conditions: d.conditions as OnboardingInput["conditions"],
  };
  const plan = generatePlan(engineInput);

  const { error } = await supabase
    .from("profiles")
    .update({
      gender: d.gender,
      age: d.age,
      height_cm: d.heightCm,
      current_weight_kg: d.currentWeightKg,
      target_weight_kg: d.targetWeightKg ?? null,
      goal: d.goal,
      activity_level: d.activityLevel,
      experience: d.experience,
      days_per_week: d.daysPerWeek,
      equipment: d.equipment,
      diet_type: d.dietType,
      allergies: d.allergies.map((a) => sanitizeText(a, 40)),
      conditions: d.conditions.map((c) => sanitizeText(c, 40)),
      medical_ack: d.medicalAck,
      medical_ack_at: d.medicalAck ? new Date().toISOString() : null,
      target_calories: plan.calories,
      target_protein: plan.protein,
      target_carbs: plan.carbs,
      target_fat: plan.fat,
      target_water_l: plan.water,
      active_split: plan.split,
      onboarding_complete: true,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  return { ok: true };
}

// --- Diet logging ---------------------------------------------------------
export async function toggleDietLog(input: {
  logId?: string;
  foodItemId?: string;
  date: string;
  food: { name: string; calories: number; protein: number; carbs: number; fat: number; meal_slot: string };
  checked: boolean;
}) {
  const { user, supabase } = await uid();
  if (input.logId) {
    await supabase.from("diet_logs").update({ checked: input.checked }).eq("id", input.logId).eq("user_id", user.id);
  } else {
    await supabase.from("diet_logs").insert({
      user_id: user.id,
      log_date: input.date,
      food_item_id: input.foodItemId ?? null,
      food_name: sanitizeText(input.food.name, 80),
      calories: input.food.calories,
      protein: input.food.protein,
      carbs: input.food.carbs,
      fat: input.food.fat,
      meal_slot: input.food.meal_slot,
      checked: input.checked,
    });
  }
  revalidatePath("/diet");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function logWater(date: string, liters: number) {
  const { user, supabase } = await uid();
  await supabase
    .from("water_logs")
    .upsert({ user_id: user.id, log_date: date, liters: Math.max(0, liters) }, { onConflict: "user_id,log_date" });
  revalidatePath("/diet");
  revalidatePath("/dashboard");
  return { ok: true };
}

// --- Weight logging -------------------------------------------------------
export async function logWeight(raw: unknown) {
  const { user, supabase } = await uid();
  const parsed = weightSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message };
  await supabase.from("weight_logs").upsert(
    {
      user_id: user.id,
      log_date: parsed.data.log_date,
      weight_kg: parsed.data.weight_kg,
      waist_cm: parsed.data.waist_cm ?? null,
    },
    { onConflict: "user_id,log_date" }
  );
  revalidatePath("/progress");
  revalidatePath("/dashboard");
  return { ok: true };
}

// --- Workout set logging --------------------------------------------------
export async function saveWorkout(input: {
  date: string;
  dayType: string;
  durationSeconds: number;
  sets: { exerciseId: string; exerciseName: string; setNumber: number; reps: number; weightKg: number }[];
}) {
  const { user, supabase } = await uid();
  // Clear today's sets for this day type, then insert fresh (idempotent finish).
  await supabase.from("workout_logs").delete().eq("user_id", user.id).eq("log_date", input.date).eq("day_type", input.dayType);
  if (input.sets.length) {
    await supabase.from("workout_logs").insert(
      input.sets.map((s) => ({
        user_id: user.id,
        log_date: input.date,
        day_type: input.dayType,
        exercise_id: s.exerciseId,
        exercise_name: s.exerciseName,
        set_number: s.setNumber,
        reps: s.reps,
        weight_kg: s.weightKg,
        duration_seconds: input.durationSeconds,
      }))
    );
  }
  revalidatePath("/workout");
  revalidatePath("/progress");
  return { ok: true };
}

// --- Personal food library ------------------------------------------------
export async function savePersonalFood(raw: unknown) {
  const { user, supabase } = await uid();
  const parsed = foodSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0]?.message };
  const f = parsed.data;
  await supabase.from("food_items").insert({
    owner_id: user.id,
    name: sanitizeText(f.name, 80),
    serving_label: sanitizeText(f.serving_label, 40),
    calories: f.calories,
    protein: f.protein,
    carbs: f.carbs,
    fat: f.fat,
    meal_slot: f.meal_slot,
    tags: f.tags,
  });
  revalidatePath("/diet");
  revalidatePath("/settings");
  return { ok: true };
}

export async function deletePersonalFood(id: string) {
  const { user, supabase } = await uid();
  await supabase.from("food_items").delete().eq("id", id).eq("owner_id", user.id);
  revalidatePath("/settings");
  return { ok: true };
}

// --- Account: export + delete (GDPR) --------------------------------------
export async function deleteAccount() {
  const { user } = await uid();
  // Service role is required to remove the auth user; cascades clean up data.
  const admin = createServiceClient();
  await admin.auth.admin.deleteUser(user.id);
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signOut() {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
