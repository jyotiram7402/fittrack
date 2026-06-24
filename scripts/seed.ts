/**
 * Seed script — run ONCE after the schema is applied.
 *
 *   1. Copy .env.example → .env and fill in the Supabase keys + SEED_ADMIN_*.
 *   2. npm install        (Vercel/CI does this; locally if you can)
 *   3. npm run seed
 *
 * It (a) creates/promotes the admin account and (b) inserts the global food
 * library. Safe to re-run: foods are only inserted if the table is empty.
 *
 * Uses the SERVICE ROLE key — never expose this in the browser.
 */
import { createClient } from "@supabase/supabase-js";
import { SEED_FOODS } from "./seedFoods";

// Load .env if present (no hard dependency on dotenv).
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("node:fs")
    .readFileSync(".env", "utf8")
    .split("\n")
    .forEach((line: string) => {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    });
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.SEED_ADMIN_EMAIL;
const adminPassword = process.env.SEED_ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

async function seedAdmin() {
  if (!adminEmail || !adminPassword) {
    console.warn("⚠️  SEED_ADMIN_EMAIL/PASSWORD not set — skipping admin creation.");
    return;
  }
  // Create the auth user (email pre-confirmed) — ignore "already exists".
  const { data: created, error } = await admin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: "Admin" },
  });

  let userId = created?.user?.id;
  if (error && !/already/i.test(error.message)) {
    console.error("Admin create error:", error.message);
  }
  if (!userId) {
    // Find existing user by listing (first page is fine for a fresh project).
    const { data: list } = await admin.auth.admin.listUsers();
    userId = list.users.find((u) => u.email === adminEmail)?.id;
  }
  if (!userId) {
    console.error("Could not resolve admin user id.");
    return;
  }
  await admin
    .from("profiles")
    .upsert(
      { id: userId, full_name: "Admin", role: "admin", onboarding_complete: true },
      { onConflict: "id" }
    );
  console.log(`✅ Admin ready: ${adminEmail}`);
}

async function seedFoods() {
  const { count } = await admin
    .from("food_items")
    .select("id", { count: "exact", head: true })
    .is("owner_id", null);
  if ((count ?? 0) > 0) {
    console.log(`ℹ️  Global foods already present (${count}) — skipping.`);
    return;
  }
  const rows = SEED_FOODS.map((f) => ({ owner_id: null, ...f }));
  const { error } = await admin.from("food_items").insert(rows);
  if (error) console.error("Food seed error:", error.message);
  else console.log(`✅ Seeded ${rows.length} global foods.`);
}

(async () => {
  await seedAdmin();
  await seedFoods();
  console.log("Done.");
  process.exit(0);
})();
