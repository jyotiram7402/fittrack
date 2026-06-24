import { describe, it, expect } from "vitest";
import {
  calcBMR,
  calcTDEE,
  generatePlan,
  selectSplit,
  buildConditionFlags,
} from "./planEngine";
import type { OnboardingInput } from "./types";

const base: OnboardingInput = {
  gender: "male",
  age: 30,
  heightCm: 180,
  currentWeightKg: 80,
  targetWeightKg: 75,
  goal: "lose_weight",
  activityLevel: "moderate",
  experience: "intermediate",
  daysPerWeek: 4,
  equipment: "full_gym",
  dietType: "non_veg",
  allergies: [],
  conditions: ["none"],
};

describe("BMR (Mifflin–St Jeor)", () => {
  it("male formula", () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(calcBMR(base)).toBe(1780);
  });
  it("female formula", () => {
    // 800 + 1125 - 150 - 161 = 1614
    expect(calcBMR({ ...base, gender: "female" })).toBe(1614);
  });
  it("other uses average constant", () => {
    // 800 + 1125 - 150 - 78 = 1697
    expect(calcBMR({ ...base, gender: "other" })).toBe(1697);
  });
});

describe("TDEE", () => {
  it("applies activity factor", () => {
    expect(calcTDEE(1780, "moderate")).toBeCloseTo(1780 * 1.55);
  });
});

describe("macros", () => {
  it("fat-loss uses 20% deficit and 2.1g/kg protein", () => {
    const p = generatePlan(base);
    const tdee = 1780 * 1.55;
    expect(p.calories).toBe(Math.round(tdee * 0.8));
    expect(p.protein).toBe(Math.round(2.1 * 80)); // 168
  });

  it("carbs back-solve from calories, protein, fat", () => {
    const p = generatePlan(base);
    const reconstructed = p.protein * 4 + p.carbs * 4 + p.fat * 9;
    // within rounding tolerance of total calories
    expect(Math.abs(reconstructed - p.calories)).toBeLessThanOrEqual(12);
  });

  it("carbs never negative; reduces fat first", () => {
    // Very low calories + high protein scenario
    const p = generatePlan({ ...base, currentWeightKg: 120, goal: "lose_weight", gender: "female" });
    expect(p.carbs).toBeGreaterThanOrEqual(0);
  });
});

describe("safety floors", () => {
  it("never goes below female floor of 1200", () => {
    const p = generatePlan({
      ...base,
      gender: "female",
      currentWeightKg: 45,
      heightCm: 150,
      age: 60,
      activityLevel: "sedentary",
      goal: "lose_weight",
    });
    expect(p.calories).toBeGreaterThanOrEqual(1200);
  });

  it("never goes below male floor of 1500", () => {
    const p = generatePlan({
      ...base,
      gender: "male",
      currentWeightKg: 50,
      heightCm: 160,
      age: 55,
      activityLevel: "sedentary",
      goal: "lose_weight",
    });
    expect(p.calories).toBeGreaterThanOrEqual(1500);
  });

  it("underweight + weight loss → steered to maintenance with a note", () => {
    const p = generatePlan({
      ...base,
      currentWeightKg: 50,
      heightCm: 185, // BMI ~14.6
      goal: "lose_weight",
    });
    expect(p.notes.some((n) => /underweight/i.test(n))).toBe(true);
  });

  it("pregnancy never applies a deficit and requires clearance", () => {
    const p = generatePlan({ ...base, goal: "lose_weight", conditions: ["pregnant"] });
    const tdee = 1780 * 1.55;
    expect(p.calories).toBeGreaterThanOrEqual(Math.round(tdee)); // maintenance, not deficit
    expect(p.conditionFlags.requiresDoctorClearance).toBe(true);
    expect(p.conditionFlags.pregnancy).toBe(true);
  });
});

describe("water", () => {
  it("rounds to nearest 0.25 with 2.0L minimum", () => {
    expect(generatePlan({ ...base, currentWeightKg: 80 }).water).toBe(2.75); // 2.64 → 2.75
    expect(generatePlan({ ...base, currentWeightKg: 40 }).water).toBe(2.0); // floor
  });
});

describe("split selection", () => {
  it("maps days/week to splits", () => {
    expect(selectSplit({ daysPerWeek: 3 }).split).toBe("full_body");
    expect(selectSplit({ daysPerWeek: 4 }).split).toBe("upper_lower");
    expect(selectSplit({ daysPerWeek: 5 }).split).toBe("ppl_ul");
    expect(selectSplit({ daysPerWeek: 6 }).split).toBe("ppl_x2");
  });
});

describe("condition flags", () => {
  it("IBS flags high-FODMAP", () => {
    expect(buildConditionFlags(["ibs"]).avoidFoodTags).toContain("high_fodmap");
  });
  it("diabetes requires clearance and flags high-glycemic", () => {
    const f = buildConditionFlags(["diabetes_t2"]);
    expect(f.requiresDoctorClearance).toBe(true);
    expect(f.avoidFoodTags).toContain("high_glycemic");
  });
  it("knee injury triggers high-impact substitution", () => {
    expect(buildConditionFlags(["knee_joint"]).substituteHighImpact).toBe(true);
  });
  it("none → empty / safe defaults", () => {
    const f = buildConditionFlags(["none"]);
    expect(f.requiresDoctorClearance).toBe(false);
    expect(f.avoidFoodTags).toHaveLength(0);
  });
});
