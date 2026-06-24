import { redirect } from "next/navigation";
import { createServerSupabase } from "./supabase/server";
import type { Profile } from "./types";

// Returns the authenticated user's profile, or redirects to /login.
export async function requireProfile(): Promise<Profile> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  if (!profile.onboarding_complete) redirect("/onboarding");
  return profile as Profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}

// Profile without onboarding redirect (used by the onboarding page itself).
export async function getProfileRaw(): Promise<Profile | null> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data as Profile) ?? null;
}
