// Build-time fetch of the free-exercise-db dataset.
// Runs on Vercel's build servers (which have internet) BEFORE `next build`.
// If the download fails for any reason, it writes a small sample so the
// build never breaks — you can re-deploy to retry the full fetch.
//
// Local machines without internet simply keep whatever file already exists
// (or the sample). Nothing here touches anything outside ./public/data.

import { mkdir, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";

const URL_SRC = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const OUT_DIR = "public/data";
const OUT_FILE = `${OUT_DIR}/exercises.json`;

const SAMPLE = [
  {
    id: "Barbell_Bench_Press_-_Medium_Grip",
    name: "Barbell Bench Press - Medium Grip",
    force: "push", level: "beginner", mechanic: "compound", equipment: "barbell",
    primaryMuscles: ["chest"], secondaryMuscles: ["shoulders", "triceps"],
    instructions: ["Lie back on a flat bench gripping the bar shoulder-width.", "Lower the bar to mid-chest.", "Press back up to the start."],
    category: "strength",
    images: ["Barbell_Bench_Press_-_Medium_Grip/0.jpg", "Barbell_Bench_Press_-_Medium_Grip/1.jpg"],
  },
  {
    id: "Pushups",
    name: "Pushups",
    force: "push", level: "beginner", mechanic: "compound", equipment: "body only",
    primaryMuscles: ["chest"], secondaryMuscles: ["shoulders", "triceps"],
    instructions: ["Start in a plank with hands under shoulders.", "Lower until your chest nearly touches the floor.", "Press back up."],
    category: "strength",
    images: ["Pushups/0.jpg", "Pushups/1.jpg"],
  },
  {
    id: "Dumbbell_Goblet_Squat",
    name: "Dumbbell Goblet Squat",
    force: "push", level: "beginner", mechanic: "compound", equipment: "dumbbell",
    primaryMuscles: ["quadriceps"], secondaryMuscles: ["glutes", "hamstrings"],
    instructions: ["Hold a dumbbell at your chest.", "Squat down keeping your chest up.", "Drive through your heels to stand."],
    category: "strength",
    images: ["Dumbbell_Goblet_Squat/0.jpg", "Dumbbell_Goblet_Squat/1.jpg"],
  },
];

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    const res = await fetch(URL_SRC, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    await writeFile(OUT_FILE, JSON.stringify(data));
    console.log(`✅ Fetched ${Array.isArray(data) ? data.length : "?"} exercises → ${OUT_FILE}`);
    return;
  } catch (err) {
    console.warn(`⚠️  Could not fetch exercises (${err?.message}).`);
  }

  // Fallback: keep an existing file, else write the sample.
  if (await exists(OUT_FILE)) {
    console.log("ℹ️  Keeping existing exercises.json.");
  } else {
    await writeFile(OUT_FILE, JSON.stringify(SAMPLE));
    console.log(`ℹ️  Wrote ${SAMPLE.length}-exercise sample fallback.`);
  }
}

main();
