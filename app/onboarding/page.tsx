import { redirect } from "next/navigation";
import { getProfileRaw } from "@/lib/auth";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata = { title: "Set up your plan" };

export default async function OnboardingPage() {
  const profile = await getProfileRaw();
  if (!profile) redirect("/login");

  // Pre-fill if they're editing existing answers.
  const initial = {
    goal: profile.goal ?? undefined,
    gender: profile.gender ?? undefined,
    age: profile.age ?? undefined,
    heightCm: profile.height_cm ?? undefined,
    currentWeightKg: profile.current_weight_kg ?? undefined,
    targetWeightKg: profile.target_weight_kg ?? undefined,
    activityLevel: profile.activity_level ?? undefined,
    experience: profile.experience ?? undefined,
    daysPerWeek: profile.days_per_week ?? undefined,
    equipment: profile.equipment ?? undefined,
    dietType: profile.diet_type ?? undefined,
    allergies: profile.allergies ?? [],
    conditions: profile.conditions ?? [],
    medicalAck: profile.medical_ack ?? false,
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg px-5 py-6">
      <OnboardingWizard initial={initial} fullName={profile.full_name} />
    </div>
  );
}
