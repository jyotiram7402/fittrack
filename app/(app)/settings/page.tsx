import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { ProfileCard } from "@/components/settings/ProfileCard";
import { GOAL_LABELS } from "@/lib/constants";
import type { FoodItem } from "@/lib/types";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const profile = await requireProfile();
  const supabase = createServerSupabase();
  const { data: foods } = await supabase
    .from("food_items")
    .select("*")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Settings</h1>

      <ProfileCard
        fullName={profile.full_name ?? ""}
        goalLabel={profile.goal ? GOAL_LABELS[profile.goal] : "No goal set"}
        age={profile.age}
        heightCm={profile.height_cm ? Number(profile.height_cm) : null}
        weightKg={profile.current_weight_kg ? Number(profile.current_weight_kg) : null}
        occupation={profile.occupation ?? null}
        gymName={profile.gym_name ?? null}
        avatarUrl={profile.avatar_url ?? null}
      />

      <section className="card">
        <h2 className="font-semibold">Your plan inputs</h2>
        <p className="mt-1 text-sm text-slate-500">Edit your goal, body stats, diet or conditions. Your plan recalculates automatically.</p>
        <Link href="/onboarding" className="btn-primary mt-3">Edit answers & recalculate</Link>
      </section>

      <SettingsClient foods={(foods as FoodItem[]) ?? []} email={profile.full_name ?? ""} />
    </div>
  );
}
