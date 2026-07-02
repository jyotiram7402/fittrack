// Bundled food database — Indian + common foods with macros per stated serving.
// Ships with the app (no DB seeding needed) so the food picker always has
// suggestions, even offline. Macros are realistic estimates per serving.
//
// Serving conventions: 1 katori ≈ 150 g cooked · 1 plate ≈ 250 g ·
// half plate ≈ 125 g · 1 tbsp ≈ 15 g · 1 roti ≈ 40 g.

export type Slot = "breakfast" | "lunch" | "dinner" | "snack";

export interface BundledFood {
  id: string;
  name: string;
  serving: string; // human label incl. grams
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  slot: Slot;
  tags: string[];
}

// [name, serving, slot, kcal, protein, carbs, fat, tags]
type Row = [string, string, Slot, number, number, number, number, string[]?];

const R: Row[] = [
  // ---------------- Breakfast ----------------
  ["Idli", "2 pcs (120 g)", "breakfast", 140, 4, 28, 1],
  ["Medu Vada", "1 pc (60 g)", "breakfast", 145, 3, 18, 7, ["fried"]],
  ["Plain Dosa", "1 dosa (80 g)", "breakfast", 170, 4, 28, 5],
  ["Masala Dosa", "1 dosa (150 g)", "breakfast", 290, 6, 40, 12, ["fried"]],
  ["Uttapam (onion)", "1 pc (120 g)", "breakfast", 210, 5, 32, 7, ["high_fodmap"]],
  ["Upma", "1 katori (150 g)", "breakfast", 230, 5, 36, 8, ["gluten"]],
  ["Poha", "1 plate (200 g)", "breakfast", 250, 5, 45, 6],
  ["Aloo Paratha (ghee)", "1 pc (100 g)", "breakfast", 290, 6, 40, 12, ["gluten", "fried"]],
  ["Plain Paratha", "1 pc (80 g)", "breakfast", 240, 5, 32, 10, ["gluten"]],
  ["Methi Thepla", "1 pc (50 g)", "breakfast", 120, 3, 16, 5, ["gluten"]],
  ["Besan Chilla", "2 pcs (120 g)", "breakfast", 180, 9, 20, 7],
  ["Moong Dal Chilla", "2 pcs (120 g)", "breakfast", 160, 11, 22, 3],
  ["Bread Omelette", "2 slices + 2 eggs", "breakfast", 280, 15, 26, 13, ["gluten"]],
  ["Boiled Eggs", "2 eggs (100 g)", "breakfast", 156, 12, 2, 10],
  ["Egg Bhurji", "2 eggs (120 g)", "breakfast", 220, 13, 3, 17],
  ["Masala Oats", "1 bowl (200 g)", "breakfast", 220, 8, 34, 6, ["high_fodmap"]],
  ["Daliya (veg)", "1 katori (200 g)", "breakfast", 150, 5, 27, 3, ["gluten"]],
  ["Sprouts Salad", "1 katori (100 g)", "breakfast", 120, 8, 18, 1, ["high_fodmap"]],
  ["Sabudana Khichdi", "1 katori (150 g)", "breakfast", 280, 3, 44, 10, ["high_glycemic"]],
  ["Puri Bhaji", "2 puri + aloo (200 g)", "breakfast", 350, 6, 45, 16, ["fried", "gluten"]],
  ["Cornflakes with Milk", "1 bowl (200 ml)", "breakfast", 200, 6, 36, 4, ["dairy", "high_glycemic"]],
  ["Pongal", "1 katori (150 g)", "breakfast", 280, 7, 40, 10],
  ["Appam", "1 pc (60 g)", "breakfast", 120, 2, 24, 2],
  ["Greek Yogurt", "1 cup (150 g)", "breakfast", 130, 15, 6, 4, ["dairy"]],
  ["Peanut Butter Toast", "2 slices + 1 tbsp", "breakfast", 260, 9, 30, 12, ["gluten", "nuts"]],

  // ---------------- Rotis & Rice (lunch) ----------------
  ["Chapati / Roti", "1 roti (40 g)", "lunch", 110, 3, 22, 2, ["gluten"]],
  ["Tandoori Roti", "1 pc (50 g)", "lunch", 120, 4, 24, 1, ["gluten"]],
  ["Butter Naan", "1 pc (90 g)", "lunch", 320, 8, 46, 11, ["gluten", "dairy"]],
  ["Bajra Roti", "1 pc (50 g)", "lunch", 120, 3, 22, 2],
  ["Jowar Roti", "1 pc (50 g)", "lunch", 110, 3, 22, 1],
  ["Ragi Roti", "1 pc (50 g)", "lunch", 100, 3, 20, 1],
  ["Steamed Rice", "1 katori (150 g)", "lunch", 180, 4, 40, 0, ["high_glycemic"]],
  ["Brown Rice", "1 katori (150 g)", "lunch", 160, 4, 34, 1],
  ["Jeera Rice", "1 katori (150 g)", "lunch", 210, 4, 38, 5],
  ["Curd Rice", "1 katori (200 g)", "lunch", 220, 6, 35, 6, ["dairy"]],
  ["Lemon Rice", "1 katori (150 g)", "lunch", 250, 4, 40, 8],
  ["Veg Pulao", "1 plate (250 g)", "lunch", 320, 6, 52, 9],
  ["Veg Biryani", "1 plate (250 g)", "lunch", 400, 8, 60, 13, ["spicy"]],
  ["Chicken Biryani", "1 plate (300 g)", "lunch", 480, 24, 60, 16, ["spicy", "high_glycemic"]],
  ["Mutton Biryani", "1 plate (300 g)", "lunch", 550, 26, 58, 22, ["spicy"]],
  ["Khichdi", "1 katori (200 g)", "lunch", 200, 8, 32, 4],

  // ---------------- Dals & Curries (lunch) ----------------
  ["Dal Tadka", "1 katori (150 g)", "lunch", 180, 9, 22, 6, ["high_fodmap"]],
  ["Moong Dal", "1 katori (150 g)", "lunch", 150, 10, 22, 2, ["high_fodmap"]],
  ["Masoor Dal", "1 katori (150 g)", "lunch", 160, 10, 23, 2, ["high_fodmap"]],
  ["Dal Makhani", "1 katori (150 g)", "lunch", 280, 10, 26, 14, ["dairy", "high_fodmap"]],
  ["Sambar", "1 katori (150 g)", "lunch", 130, 6, 20, 3, ["high_fodmap"]],
  ["Rajma", "1 katori (150 g)", "lunch", 230, 13, 38, 2, ["high_fodmap"]],
  ["Chole", "1 katori (150 g)", "lunch", 270, 12, 34, 9, ["high_fodmap", "spicy"]],
  ["Kadhi", "1 katori (150 g)", "lunch", 160, 5, 12, 10, ["dairy"]],
  ["Palak Paneer", "1 katori (150 g)", "lunch", 270, 12, 9, 20, ["dairy"]],
  ["Paneer Butter Masala", "1 katori (150 g)", "lunch", 360, 12, 14, 28, ["dairy"]],
  ["Matar Paneer", "1 katori (150 g)", "lunch", 300, 12, 16, 20, ["dairy", "high_fodmap"]],
  ["Bhindi Sabzi", "1 katori (100 g)", "lunch", 120, 2, 10, 8],
  ["Aloo Gobi", "1 katori (150 g)", "lunch", 150, 3, 20, 7, ["high_fodmap"]],
  ["Mix Veg Sabzi", "1 katori (150 g)", "lunch", 140, 3, 14, 8],
  ["Baingan Bharta", "1 katori (150 g)", "lunch", 130, 2, 12, 8],
  ["Lauki Sabzi", "1 katori (150 g)", "lunch", 90, 2, 10, 5],
  ["Karela Sabzi", "1 katori (100 g)", "lunch", 100, 2, 10, 6],
  ["Green Salad", "half plate (125 g)", "lunch", 40, 2, 8, 0],
  ["Cucumber Raita", "1 katori (100 g)", "lunch", 90, 3, 6, 6, ["dairy"]],
  ["Plain Curd (Dahi)", "1 katori (100 g)", "lunch", 100, 4, 5, 7, ["dairy"]],
  ["Veg Thali (full)", "1 thali", "lunch", 650, 18, 90, 22],

  // ---------------- Non-veg mains (dinner) ----------------
  ["Chicken Curry", "1 katori (150 g)", "dinner", 280, 24, 8, 17, ["spicy"]],
  ["Butter Chicken", "1 katori (150 g)", "dinner", 430, 24, 10, 32, ["dairy"]],
  ["Chicken Tikka", "6 pcs (150 g)", "dinner", 260, 32, 5, 12],
  ["Tandoori Chicken", "2 pcs (200 g)", "dinner", 320, 40, 5, 15, ["spicy"]],
  ["Grilled Chicken Breast", "150 g", "dinner", 248, 47, 0, 5],
  ["Fish Curry", "1 katori (150 g)", "dinner", 230, 22, 6, 13, ["spicy"]],
  ["Fish Fry", "1 pc (100 g)", "dinner", 250, 20, 8, 15, ["fried"]],
  ["Grilled Fish", "150 g", "dinner", 200, 34, 0, 7],
  ["Egg Curry", "2 eggs (200 g)", "dinner", 260, 14, 6, 20, ["spicy"]],
  ["Mutton Curry", "1 katori (150 g)", "dinner", 350, 26, 6, 24, ["spicy"]],
  ["Prawn Masala", "1 katori (150 g)", "dinner", 220, 24, 8, 10, ["shellfish", "spicy"]],
  ["Tofu (stir-fried)", "150 g", "dinner", 160, 15, 5, 9],
  ["Soya Chunk Curry", "1 katori (150 g)", "dinner", 210, 22, 14, 7, ["soy"]],
  ["Chicken Soup", "1 bowl (250 ml)", "dinner", 120, 12, 8, 4],
  ["Paneer Tikka", "6 pcs (150 g)", "dinner", 300, 18, 8, 22, ["dairy"]],

  // ---------------- Street food & heavy (dinner) ----------------
  ["Pav Bhaji", "1 plate (2 pav)", "dinner", 400, 9, 55, 16, ["fried", "gluten"]],
  ["Chole Bhature", "1 plate (2 bhature)", "dinner", 550, 14, 68, 25, ["fried", "gluten"]],
  ["Veg Momos", "6 pcs (180 g)", "dinner", 210, 6, 36, 5, ["gluten"]],
  ["Chicken Momos", "6 pcs (180 g)", "dinner", 250, 14, 34, 7, ["gluten"]],
  ["Chicken Roll", "1 roll (180 g)", "dinner", 380, 18, 40, 16, ["gluten", "fried"]],

  // ---------------- Snacks ----------------
  ["Samosa", "1 pc (80 g)", "snack", 260, 4, 28, 15, ["fried", "gluten", "processed"]],
  ["Kachori", "1 pc (60 g)", "snack", 210, 4, 22, 12, ["fried", "gluten"]],
  ["Veg Pakora", "5 pcs (100 g)", "snack", 250, 6, 22, 16, ["fried"]],
  ["Vada Pav", "1 pc (150 g)", "snack", 290, 6, 40, 12, ["fried", "gluten"]],
  ["Pani Puri", "6 pcs", "snack", 180, 3, 30, 6, ["fried", "spicy"]],
  ["Bhel Puri", "1 plate (150 g)", "snack", 220, 5, 38, 6],
  ["Dhokla", "2 pcs (100 g)", "snack", 160, 6, 24, 5],
  ["Khandvi", "4 pcs (80 g)", "snack", 150, 6, 16, 7, ["dairy"]],
  ["Aloo Tikki", "1 pc (80 g)", "snack", 180, 3, 24, 8, ["fried"]],
  ["Roasted Chana", "1 handful (30 g)", "snack", 120, 7, 18, 2, ["high_fodmap"]],
  ["Roasted Peanuts", "1 handful (30 g)", "snack", 170, 8, 5, 14, ["nuts"]],
  ["Roasted Makhana", "1 katori (25 g)", "snack", 110, 3, 18, 2],
  ["Almonds", "10 pcs (12 g)", "snack", 70, 3, 2, 6, ["nuts"]],
  ["Walnuts", "4 halves (15 g)", "snack", 100, 2, 2, 10, ["nuts"]],
  ["Peanut Chikki", "1 pc (25 g)", "snack", 130, 4, 14, 7, ["nuts", "sugary"]],
  ["Fruit Chaat", "1 katori (150 g)", "snack", 100, 1, 24, 0],
  ["Banana", "1 medium (120 g)", "snack", 105, 1, 27, 0, ["high_glycemic"]],
  ["Apple", "1 medium (180 g)", "snack", 95, 0, 25, 0, ["high_fodmap"]],
  ["Mango", "1 cup (165 g)", "snack", 150, 1, 38, 1, ["high_glycemic", "high_fodmap"]],
  ["Papaya", "1 cup (140 g)", "snack", 60, 1, 15, 0],
  ["Coconut Water", "1 glass (250 ml)", "snack", 45, 0, 11, 0],
  ["Buttermilk (Chaas)", "1 glass (250 ml)", "snack", 60, 3, 5, 3, ["dairy"]],
  ["Sweet Lassi", "1 glass (250 ml)", "snack", 220, 6, 32, 8, ["dairy", "sugary"]],
  ["Masala Chai", "1 cup (150 ml)", "snack", 90, 2, 12, 3, ["dairy", "caffeine"]],
  ["Black Coffee", "1 cup (150 ml)", "snack", 5, 0, 0, 0, ["caffeine"]],
  ["Whey Protein Shake", "1 scoop + water", "snack", 120, 24, 3, 1, ["dairy"]],
  ["Boiled Egg", "1 egg (50 g)", "snack", 78, 6, 1, 5],
  ["Maggi Noodles", "1 pack (70 g)", "snack", 380, 8, 54, 14, ["processed", "high_sodium", "gluten"]],
  ["Namkeen Mixture", "1 handful (30 g)", "snack", 160, 3, 15, 10, ["fried", "processed", "high_sodium"]],
  ["Marie Biscuits", "4 pcs (28 g)", "snack", 120, 2, 20, 3, ["gluten", "processed"]],
  ["Parle-G Biscuits", "4 pcs (25 g)", "snack", 110, 2, 19, 3, ["gluten", "processed", "sugary"]],

  // ---------------- Sweets ----------------
  ["Gulab Jamun", "1 pc (40 g)", "snack", 150, 2, 20, 7, ["sugary", "dairy", "fried"]],
  ["Rasgulla", "1 pc (50 g)", "snack", 106, 2, 22, 1, ["sugary", "dairy"]],
  ["Jalebi", "2 pcs (50 g)", "snack", 220, 2, 34, 9, ["fried", "sugary", "high_glycemic"]],
  ["Kheer", "1 katori (150 g)", "snack", 250, 6, 38, 8, ["dairy", "sugary"]],
  ["Sooji Halwa", "1 katori (100 g)", "snack", 320, 4, 42, 15, ["gluten", "sugary"]],
  ["Besan Ladoo", "1 pc (40 g)", "snack", 180, 4, 20, 10, ["sugary"]],
  ["Kaju Barfi", "1 pc (25 g)", "snack", 150, 3, 14, 9, ["dairy", "nuts", "sugary"]],
  ["Ice Cream (vanilla)", "1 scoop (65 g)", "snack", 140, 2, 16, 7, ["dairy", "sugary"]],
  ["Dark Chocolate", "2 squares (20 g)", "snack", 110, 1, 9, 8, ["caffeine"]],
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_");

export const INDIAN_FOODS: BundledFood[] = R.map(([name, serving, slot, calories, protein, carbs, fat, tags]) => ({
  id: `bundled_${slug(name)}`,
  name,
  serving,
  calories,
  protein,
  carbs,
  fat,
  slot,
  tags: tags ?? [],
}));

// Portion multipliers shown in the picker.
export const PORTIONS = [
  { label: "½", mult: 0.5 },
  { label: "1", mult: 1 },
  { label: "1½", mult: 1.5 },
  { label: "2", mult: 2 },
] as const;
