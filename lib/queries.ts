import { createServerSupabase } from "./supabase/server";
import type { FoodItem } from "./types";
import { todayStr } from "./date";

export { todayStr };

export interface DietLogRow {
  id: string;
  food_item_id: string | null;
  food_name: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_slot: string;
  checked: boolean;
}

export async function getDietLogs(userId: string, date: string): Promise<DietLogRow[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("diet_logs")
    .select("id, food_item_id, food_name, calories, protein, carbs, fat, meal_slot, checked")
    .eq("user_id", userId)
    .eq("log_date", date)
    .order("created_at");
  return (data as DietLogRow[]) ?? [];
}

export function sumChecked(rows: DietLogRow[]) {
  return rows
    .filter((r) => r.checked)
    .reduce(
      (acc, r) => ({
        calories: acc.calories + (r.calories || 0),
        protein: acc.protein + (Number(r.protein) || 0),
        carbs: acc.carbs + (Number(r.carbs) || 0),
        fat: acc.fat + (Number(r.fat) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
}

export async function getWater(userId: string, date: string): Promise<number> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("water_logs")
    .select("liters")
    .eq("user_id", userId)
    .eq("log_date", date)
    .maybeSingle();
  return Number(data?.liters ?? 0);
}

export interface WeightRow {
  log_date: string;
  weight_kg: number;
  waist_cm: number | null;
}

export async function getWeightLogs(userId: string, sinceDays = 365): Promise<WeightRow[]> {
  const supabase = createServerSupabase();
  const since = todayStr(new Date(Date.now() - sinceDays * 86400000));
  const { data } = await supabase
    .from("weight_logs")
    .select("log_date, weight_kg, waist_cm")
    .eq("user_id", userId)
    .gte("log_date", since)
    .order("log_date");
  return (data as WeightRow[]) ?? [];
}

export async function getGlobalFoods(userId: string): Promise<FoodItem[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("food_items")
    .select("*")
    .or(`owner_id.is.null,owner_id.eq.${userId}`)
    .order("meal_slot");
  return (data as FoodItem[]) ?? [];
}

export async function getWorkoutLogs(userId: string, sinceDays = 90) {
  const supabase = createServerSupabase();
  const since = todayStr(new Date(Date.now() - sinceDays * 86400000));
  const { data } = await supabase
    .from("workout_logs")
    .select("log_date, day_type, exercise_id, exercise_name, set_number, reps, weight_kg, duration_seconds")
    .eq("user_id", userId)
    .gte("log_date", since)
    .order("log_date");
  return data ?? [];
}

export async function getDietAdherence(userId: string, sinceDays = 30) {
  const supabase = createServerSupabase();
  const since = todayStr(new Date(Date.now() - sinceDays * 86400000));
  const { data } = await supabase
    .from("diet_logs")
    .select("log_date, calories, protein, checked")
    .eq("user_id", userId)
    .eq("checked", true)
    .gte("log_date", since);
  return data ?? [];
}
