// Global food library seeded into food_items (owner_id = null).
// Macros are per the stated serving. Tags drive condition-aware warnings.
export interface SeedFood {
  name: string;
  serving_label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_slot: string;
  tags: string[];
}

export const SEED_FOODS: SeedFood[] = [
  // --- Breakfast ---
  { name: "Oats with milk", serving_label: "1 bowl (40g oats)", calories: 220, protein: 9, carbs: 33, fat: 6, meal_slot: "breakfast", tags: ["dairy", "high_fodmap"] },
  { name: "Idli (2 pcs)", serving_label: "2 idli", calories: 140, protein: 4, carbs: 28, fat: 1, meal_slot: "breakfast", tags: [] },
  { name: "Masala dosa", serving_label: "1 dosa", calories: 290, protein: 6, carbs: 40, fat: 12, meal_slot: "breakfast", tags: ["fried"] },
  { name: "Poha", serving_label: "1 plate", calories: 250, protein: 5, carbs: 45, fat: 6, meal_slot: "breakfast", tags: [] },
  { name: "Scrambled eggs (2)", serving_label: "2 eggs", calories: 180, protein: 12, carbs: 2, fat: 14, meal_slot: "breakfast", tags: [] },
  { name: "Greek yogurt", serving_label: "150g", calories: 130, protein: 15, carbs: 6, fat: 4, meal_slot: "breakfast", tags: ["dairy"] },
  { name: "Whole-wheat toast (2)", serving_label: "2 slices", calories: 160, protein: 6, carbs: 28, fat: 2, meal_slot: "breakfast", tags: ["gluten"] },
  { name: "Banana", serving_label: "1 medium", calories: 105, protein: 1, carbs: 27, fat: 0, meal_slot: "breakfast", tags: ["high_glycemic"] },

  // --- Lunch / Dinner ---
  { name: "Chicken breast (grilled)", serving_label: "150g", calories: 248, protein: 47, carbs: 0, fat: 5, meal_slot: "lunch", tags: [] },
  { name: "Paneer (100g)", serving_label: "100g", calories: 265, protein: 18, carbs: 4, fat: 21, meal_slot: "lunch", tags: ["dairy"] },
  { name: "Tofu (150g)", serving_label: "150g", calories: 110, protein: 12, carbs: 3, fat: 6, meal_slot: "lunch", tags: [] },
  { name: "Dal (1 cup)", serving_label: "1 cup", calories: 200, protein: 12, carbs: 30, fat: 4, meal_slot: "lunch", tags: ["high_fodmap"] },
  { name: "Rajma (1 cup)", serving_label: "1 cup", calories: 230, protein: 13, carbs: 38, fat: 2, meal_slot: "lunch", tags: ["high_fodmap"] },
  { name: "Chapati / Roti", serving_label: "1 roti", calories: 110, protein: 3, carbs: 22, fat: 2, meal_slot: "lunch", tags: ["gluten"] },
  { name: "Brown rice (1 cup)", serving_label: "1 cup cooked", calories: 215, protein: 5, carbs: 45, fat: 2, meal_slot: "lunch", tags: [] },
  { name: "White rice (1 cup)", serving_label: "1 cup cooked", calories: 205, protein: 4, carbs: 45, fat: 0, meal_slot: "lunch", tags: ["high_glycemic"] },
  { name: "Mixed vegetable curry", serving_label: "1 cup", calories: 150, protein: 4, carbs: 15, fat: 8, meal_slot: "lunch", tags: [] },
  { name: "Salmon (grilled)", serving_label: "150g", calories: 280, protein: 39, carbs: 0, fat: 13, meal_slot: "dinner", tags: [] },
  { name: "Egg curry (2 eggs)", serving_label: "2 eggs", calories: 260, protein: 14, carbs: 6, fat: 20, meal_slot: "dinner", tags: ["spicy"] },
  { name: "Grilled fish", serving_label: "150g", calories: 200, protein: 34, carbs: 0, fat: 7, meal_slot: "dinner", tags: [] },
  { name: "Mixed green salad", serving_label: "1 large bowl", calories: 90, protein: 3, carbs: 10, fat: 4, meal_slot: "dinner", tags: [] },
  { name: "Chicken biryani", serving_label: "1 plate", calories: 480, protein: 24, carbs: 60, fat: 16, meal_slot: "dinner", tags: ["spicy", "high_glycemic"] },

  // --- Snacks ---
  { name: "Whey protein shake", serving_label: "1 scoop + water", calories: 120, protein: 24, carbs: 3, fat: 1, meal_slot: "snack", tags: ["dairy"] },
  { name: "Almonds (handful)", serving_label: "30g", calories: 175, protein: 6, carbs: 6, fat: 15, meal_slot: "snack", tags: ["nuts"] },
  { name: "Apple", serving_label: "1 medium", calories: 95, protein: 0, carbs: 25, fat: 0, meal_slot: "snack", tags: ["high_fodmap"] },
  { name: "Peanut butter (1 tbsp)", serving_label: "1 tbsp", calories: 95, protein: 4, carbs: 3, fat: 8, meal_slot: "snack", tags: ["nuts"] },
  { name: "Roasted chana", serving_label: "30g", calories: 120, protein: 7, carbs: 18, fat: 2, meal_slot: "snack", tags: ["high_fodmap"] },
  { name: "Cottage cheese (low-fat)", serving_label: "100g", calories: 98, protein: 11, carbs: 3, fat: 4, meal_slot: "snack", tags: ["dairy"] },
  { name: "Boiled egg", serving_label: "1 egg", calories: 78, protein: 6, carbs: 1, fat: 5, meal_slot: "snack", tags: [] },
  { name: "Dark chocolate (2 sq)", serving_label: "20g", calories: 110, protein: 1, carbs: 9, fat: 8, meal_slot: "snack", tags: ["caffeine"] },
  { name: "Samosa", serving_label: "1 pc", calories: 260, protein: 4, carbs: 28, fat: 15, meal_slot: "snack", tags: ["fried", "processed"] },
  { name: "Instant noodles", serving_label: "1 pack", calories: 380, protein: 8, carbs: 54, fat: 14, meal_slot: "snack", tags: ["high_sodium", "processed", "gluten"] },
];
