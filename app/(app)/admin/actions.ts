"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, createServiceClient } from "@/lib/supabase/server";

// Ensures the caller is an admin before any privileged operation.
async function assertAdmin() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") throw new Error("Forbidden");
}

export async function setSuspended(userId: string, suspended: boolean) {
  await assertAdmin();
  const admin = createServiceClient();
  await admin.from("profiles").update({ suspended }).eq("id", userId);
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminDeleteUser(userId: string) {
  await assertAdmin();
  const admin = createServiceClient();
  await admin.auth.admin.deleteUser(userId); // cascades to profile + logs
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveGlobalFood(input: {
  name: string;
  serving_label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_slot: string;
  tags: string[];
}) {
  await assertAdmin();
  const admin = createServiceClient();
  await admin.from("food_items").insert({ owner_id: null, ...input });
  revalidatePath("/admin");
  return { ok: true };
}
