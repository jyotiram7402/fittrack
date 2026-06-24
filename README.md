# FitTrack 🏋️

A public, mobile-first fitness & diet web app. Visitors sign up, complete an onboarding
questionnaire, and instantly get a **personalized diet + workout plan** they track daily — adapted
to their goal, body, and any medical conditions they declare.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind + Supabase + Recharts**. Designed to
deploy on **Vercel** with a free Supabase backend.

> ⚠️ **Health product disclaimer.** FitTrack provides general fitness & nutrition information, not
> medical advice. The Plan Engine's safety floors, medical-acknowledgment gates, and doctor-clearance
> notes are intentional and must stay. Have a qualified professional review the disclaimers before
> going live to real users, and consider an age gate for under-18s.

---

## What's inside

| Area | Files |
|------|-------|
| Plan Engine (formulas + safety) | `lib/planEngine.ts`, tests in `lib/planEngine.test.ts` |
| Database + RLS | `supabase/schema.sql` |
| Auth (email/password, Google, reset) | `app/(auth)/*`, `app/auth/callback/route.ts`, `middleware.ts` |
| Onboarding wizard | `app/onboarding`, `components/onboarding/OnboardingWizard.tsx` |
| App pages | `app/(app)/{dashboard,diet,workout,exercises,progress,plan,settings,admin}` |
| Server actions | `app/actions.ts`, `app/(app)/admin/actions.ts` |
| Exercises | `lib/exercises.ts`, `components/ExerciseAnimation.tsx`, fetched by `scripts/fetch-exercises.mjs` |
| Seed | `scripts/seed.ts`, `scripts/seedFoods.ts` |
| PWA / SEO | `public/manifest.json`, `public/sw.js`, `app/robots.ts`, `app/sitemap.ts` |

---

## ⚙️ This project is built to deploy without running anything locally

You don't need npm on your machine. Push to GitHub and let Vercel install + build. The exercise
dataset is **downloaded automatically during the Vercel build** (`prebuild` → `scripts/fetch-exercises.mjs`),
so nothing is fetched on your computer.

### 1. Create a Supabase project
- supabase.com → New project. Note the **Project URL**, **anon key**, **service_role key**
  (Settings → API).
- SQL Editor → New query → paste all of **`supabase/schema.sql`** → Run. This creates every table,
  RLS policy, the new-user trigger, and the private `progress` storage bucket.
- (Optional) Authentication → Providers → enable **Google** and add your client id/secret.
- Authentication → Email → keep "Confirm email" ON so verification is required.

### 2. Push this folder to GitHub
Create a new repo and upload these files (GitHub web UI works fine — drag the folder in).

### 3. Import into Vercel
- vercel.com → New Project → import the repo. Framework auto-detects as Next.js.
- Add **Environment Variables** (copy names from `.env.example`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`  ← server-only, never exposed to the browser
  - `NEXT_PUBLIC_SITE_URL`  ← your Vercel URL, e.g. `https://fittrack.vercel.app`
  - (optional) `SENTRY_DSN`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`
- Deploy.

### 4. Point Supabase at your live URL
Supabase → Authentication → URL Configuration:
- **Site URL** = your Vercel URL
- **Redirect URLs** = `https://YOUR-URL/auth/callback`

### 5. Seed the admin + global foods (run once)
The seed needs the service-role key. Two easy options:

- **Vercel CLI on any internet machine:** `vercel env pull .env` then `npm install && npm run seed`.
- **Supabase SQL/Studio:** create your account via the normal signup, then in SQL Editor run
  `update profiles set role='admin', onboarding_complete=true where id = (select id from auth.users where email='you@example.com');`
  and insert foods from `scripts/seedFoods.ts` (or run `npm run seed` anywhere with internet + the env vars).

### 6. Install on your phone
Open the site on mobile → **Add to Home Screen**. It runs like a native app (PWA, offline viewing).

---

## The Plan Engine (the core)

`lib/planEngine.ts` is pure and unit-tested. Given onboarding inputs it returns calories, protein,
carbs, fat, water, a workout split, condition flags, and safety notes.

- **BMR** Mifflin–St Jeor · **TDEE** = BMR × activity factor · goal multipliers (deficit/surplus).
- **Safety floors:** never below 1500 kcal (male) / 1200 kcal (female); underweight + weight-loss →
  steered to maintenance; **pregnancy never gets a deficit** and always requires doctor clearance.
- **Condition flags:** tag risky foods (high-FODMAP, high-GI, high-sodium, dairy, gluten…), swap
  high-impact / heavy-spinal-load lifts for joint-friendly variants, and gate aggressive programming
  for diabetes / hypertension / heart conditions / pregnancy.

Run the tests (any machine with internet + npm): `npm install && npm test`.

---

## Exercise data
`scripts/fetch-exercises.mjs` downloads the public-domain
[free-exercise-db](https://github.com/yuhonas/free-exercise-db) (~800 exercises) to
`/public/data/exercises.json` during the Vercel build. If the download ever fails, it writes a small
3-exercise sample so the build still succeeds — just redeploy to retry. Images animate by alternating
the start/end frames (`components/ExerciseAnimation.tsx`).

## Optional: nicer PWA icons
`public/icons/icon.svg` is used by default. For best install fidelity add `icon-192.png` and
`icon-512.png` to `public/icons/` and re-add them to `public/manifest.json`.

## Go-live checklist
See the prompt's checklist: verify email + reset flows, confirm RLS isolation, keep the service-role
key server-only, publish the legal pages, test Plan Engine safety floors, run Lighthouse mobile,
connect a custom domain, and confirm export/delete-account work.
