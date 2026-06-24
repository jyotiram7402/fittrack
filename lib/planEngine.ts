// FitTrack Plan Engine
// ---------------------------------------------------------------------------
// Pure, deterministic module. Given onboarding inputs it returns calorie /
// macro / water targets, a workout split, condition-aware flags, and safety
// notes. No side effects, no I/O — fully unit-testable (see planEngine.test.ts).
//
// IMPORTANT: All outputs are general fitness estimates, NOT medical advice.
// Safety floors, doctor-clearance gates and pregnancy handling are mandatory.

import type {
  ActivityLevel,
  Condition,
  ConditionFlags,
  GeneratedPlan,
  Goal,
  OnboardingInput,
  SplitType,
} from "./types";

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9,
};

const GOAL_CALORIE_FACTORS: Record<Goal, number> = {
  lose_weight: 0.8,
  gain_weight: 1.15,
  build_muscle: 1.1,
  recomp: 0.95,
  maintain: 1.0,
};

// Absolute calorie safety floors (kcal/day).
const FLOOR_MALE = 1500;
const FLOOR_FEMALE = 1200;

const round = (n: number) => Math.round(n);

// --- 5a. BMR (Mifflin–St Jeor) -------------------------------------------
export function calcBMR(input: Pick<OnboardingInput, "gender" | "currentWeightKg" | "heightCm" | "age">): number {
  const { gender, currentWeightKg: w, heightCm: h, age } = input;
  const base = 10 * w + 6.25 * h - 5 * age;
  switch (gender) {
    case "male":
      return base + 5;
    case "female":
      return base - 161;
    default:
      // "other" / "prefer not to say" → average of male/female constants (+5, -161) ≈ -78
      return base - 78;
  }
}

export function calcTDEE(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activity];
}

export function calcBMI(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

// --- Main engine ----------------------------------------------------------
export function generatePlan(input: OnboardingInput): GeneratedPlan {
  const notes: string[] = [];
  const conditions = input.conditions ?? [];
  const isPregnant = conditions.includes("pregnant");

  const bmr = calcBMR(input);
  const tdee = calcTDEE(bmr, input.activityLevel);
  const bmi = calcBMI(input.currentWeightKg, input.heightCm);

  // --- 5a. Goal calories -------------------------------------------------
  let effectiveGoal: Goal = input.goal;

  // BMI < 18.5 + weight-loss goal → warn and steer away from a deficit.
  if (bmi < 18.5 && input.goal === "lose_weight") {
    notes.push(
      "Your BMI is in the underweight range, so a weight-loss plan isn't recommended. We've set you to maintenance — consider a gentle gain and speak with a professional."
    );
    effectiveGoal = "maintain";
  }

  // Pregnancy → never apply a deficit; default to maintenance.
  if (isPregnant) {
    if (GOAL_CALORIE_FACTORS[effectiveGoal] < 1.0) {
      notes.push(
        "Because you indicated you're pregnant or postpartum, we never apply a calorie deficit. Your target is set to maintenance."
      );
    }
    effectiveGoal = "maintain";
  }

  let calories = tdee * GOAL_CALORIE_FACTORS[effectiveGoal];

  // --- Safety floors -----------------------------------------------------
  const floor = input.gender === "female" ? FLOOR_FEMALE : FLOOR_MALE;
  if (calories < floor) {
    notes.push(
      `To keep things safe we've raised your calorie target to the minimum of ${floor} kcal/day rather than going lower.`
    );
    calories = floor;
  }
  calories = round(calories);

  // --- 5b. Protein -------------------------------------------------------
  let proteinPerKg: number;
  switch (effectiveGoal) {
    case "lose_weight":
    case "recomp":
      proteinPerKg = 2.1;
      break;
    case "build_muscle":
    case "gain_weight":
      proteinPerKg = 1.9;
      break;
    default:
      proteinPerKg = 1.6;
  }
  let protein = round(proteinPerKg * input.currentWeightKg);

  // --- 5c. Fat -----------------------------------------------------------
  let fat = round(Math.max(0.8 * input.currentWeightKg, (0.25 * calories) / 9));

  // --- 5d. Carbs ---------------------------------------------------------
  // carbs = (cal - protein*4 - fat*9) / 4, floored at 0.
  // If negative, reduce fat first so protein is preserved.
  let carbs = (calories - protein * 4 - fat * 9) / 4;
  if (carbs < 0) {
    const deficitCals = -carbs * 4; // calories we overshot by
    const fatReductionG = Math.ceil(deficitCals / 9);
    fat = Math.max(round(0.8 * input.currentWeightKg) - 0, fat - fatReductionG);
    fat = Math.max(0, fat);
    carbs = (calories - protein * 4 - fat * 9) / 4;
  }
  carbs = Math.max(0, round(carbs));

  // --- 5e. Water ---------------------------------------------------------
  const rawWater = input.currentWeightKg * 0.033;
  let water = Math.round(rawWater / 0.25) * 0.25;
  if (water < 2.0) water = 2.0;

  // --- 5f. Split ---------------------------------------------------------
  const { split, splitLabel } = selectSplit(input);

  // --- 5g. Condition flags ----------------------------------------------
  const conditionFlags = buildConditionFlags(conditions);
  if (conditionFlags.requiresDoctorClearance) {
    notes.push(
      "You declared a condition that warrants medical sign-off. Please get clearance from your doctor before starting, and share this plan with them."
    );
  }

  // Goal-specific extras
  let stepTarget: number | undefined;
  if (effectiveGoal === "lose_weight" || input.goal === "lose_weight") {
    stepTarget = 9000;
    notes.push("Aim for ~8,000–10,000 steps/day and an optional cardio finisher to support fat loss.");
  }
  if (effectiveGoal === "build_muscle" || effectiveGoal === "gain_weight") {
    notes.push("Focus on progressive overload — add reps or a little weight each week — to drive growth on a small surplus.");
  }

  // Persistent disclaimer note (also rendered prominently in the UI).
  notes.push(
    "This is general fitness & nutrition information, not medical advice. These targets are a starting point — adjust based on real results, and consult a qualified professional, especially with a health condition."
  );

  return {
    calories,
    protein,
    carbs,
    fat,
    water,
    split,
    splitLabel,
    bmr: round(bmr),
    tdee: round(tdee),
    bmi: Math.round(bmi * 10) / 10,
    stepTarget,
    conditionFlags,
    notes,
  };
}

// --- Split selection ------------------------------------------------------
export function selectSplit(
  input: Pick<OnboardingInput, "daysPerWeek">
): { split: SplitType; splitLabel: string } {
  switch (input.daysPerWeek) {
    case 3:
      return { split: "full_body", splitLabel: "Full Body (3×/week)" };
    case 4:
      return { split: "upper_lower", splitLabel: "Upper / Lower" };
    case 5:
      return { split: "ppl_ul", splitLabel: "Push / Pull / Legs + Upper + Lower" };
    case 6:
      return { split: "ppl_x2", splitLabel: "Push / Pull / Legs ×2" };
    default:
      return { split: "full_body", splitLabel: "Full Body" };
  }
}

// --- Condition flags ------------------------------------------------------
export function buildConditionFlags(conditions: Condition[]): ConditionFlags {
  const flags: ConditionFlags = {
    avoidFoodTags: [],
    exerciseCautions: [],
    requiresDoctorClearance: false,
    pregnancy: false,
    tips: [],
    substituteHighImpact: false,
    substituteSpinalLoad: false,
    conservativeIntensity: false,
  };

  const addTags = (...tags: string[]) => {
    for (const t of tags) if (!flags.avoidFoodTags.includes(t)) flags.avoidFoodTags.push(t);
  };
  const addTip = (t: string) => {
    if (!flags.tips.includes(t)) flags.tips.push(t);
  };
  const addCaution = (c: string) => {
    if (!flags.exerciseCautions.includes(c)) flags.exerciseCautions.push(c);
  };

  for (const c of conditions) {
    switch (c) {
      case "ibs":
        addTags("high_fodmap", "dairy");
        addTip("Spread fibre through the day, eat smaller frequent meals, and stay well hydrated.");
        flags.conservativeIntensity = true;
        addCaution("Keep intensity moderate at first — gentle exercise helps gut motility.");
        break;
      case "gerd":
        addTags("spicy", "fried", "citrus", "caffeine");
        addTip("Avoid large meals and don't lie down right after eating.");
        addCaution("Avoid deep crunches or inversions right after meals.");
        break;
      case "diabetes_t2":
      case "diabetes_t1":
        addTags("high_glycemic", "sugary");
        addTip("Keep carb timing consistent and pair carbs with protein and fibre.");
        flags.requiresDoctorClearance = true;
        addCaution("Don't push very-low-carb without medical sign-off; monitor blood sugar around training.");
        break;
      case "hypertension":
        addTags("high_sodium");
        addTip("Watch sodium and prioritise potassium-rich whole foods.");
        flags.requiresDoctorClearance = true;
        addCaution("Avoid heavy breath-holding (Valsalva) and max isometrics — breathe through reps.");
        break;
      case "high_cholesterol":
        addTags("fried", "processed", "saturated_fat");
        addTip("Favour unsaturated fats and soluble fibre (oats, legumes, nuts).");
        break;
      case "pcos":
        addTip("Higher protein, resistance training and managing refined carbs can help (informational).");
        break;
      case "hypothyroidism":
        addTip("Metabolism may run a little lower — we calculate honestly; adjust from real-world results.");
        flags.requiresDoctorClearance = true;
        break;
      case "lactose_intolerance":
        addTags("dairy");
        addTip("Choose lactose-free dairy or plant alternatives.");
        break;
      case "celiac":
        addTags("gluten");
        addTip("Swap to certified gluten-free grains (rice, quinoa, GF oats).");
        break;
      case "knee_joint":
        flags.substituteHighImpact = true;
        addCaution("High-impact and deep-knee movements are swapped for joint-friendly variants (e.g. leg press). Stop if you feel pain.");
        break;
      case "lower_back":
        flags.substituteSpinalLoad = true;
        addCaution("Heavy spinal-load lifts are swapped for supported variants (e.g. chest-supported row, hip-hinge cues). Stop if you feel pain.");
        break;
      case "asthma":
        addTip("Warm up gradually for cardio and keep your inhaler nearby.");
        break;
      case "heart":
        flags.requiresDoctorClearance = true;
        flags.conservativeIntensity = true;
        addCaution("Programming is kept conservative — get cardiology clearance before intense training.");
        break;
      case "pregnant":
        flags.pregnancy = true;
        flags.requiresDoctorClearance = true;
        flags.conservativeIntensity = true;
        addCaution("Conservative defaults applied. Follow your doctor's guidance on safe activity.");
        break;
      case "none":
      default:
        break;
    }
  }

  return flags;
}
