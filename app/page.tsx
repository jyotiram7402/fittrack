import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Flame,
  HeartPulse,
  LineChart,
  Salad,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";

const features = [
  { icon: Salad, title: "Personalized macros", desc: "Calories, protein, carbs, fat & water tuned to your body and goal." },
  { icon: Dumbbell, title: "Smart workout splits", desc: "Auto-built training plan with 800+ exercises and animations." },
  { icon: HeartPulse, title: "Condition-aware", desc: "Flags foods & swaps exercises for IBS, diabetes, joint pain & more." },
  { icon: LineChart, title: "Track everything", desc: "Tick meals, log lifts & weight, and watch the graphs move." },
];

const steps = [
  { n: 1, title: "Sign up free", desc: "Email or Google. Takes 20 seconds." },
  { n: 2, title: "Answer a few questions", desc: "Goal, body stats, activity, diet & any health conditions." },
  { n: 3, title: "Get your plan instantly", desc: "Personalized nutrition + training, ready to track today." },
];

const faqs = [
  { q: "Is it free?", a: "Yes — sign up and get your full plan at no cost. Premium analytics may come later." },
  { q: "Do you give medical advice?", a: "No. FitTrack gives general fitness & nutrition guidance and asks you to consult a professional, especially with health conditions." },
  { q: "Does it work on my phone?", a: "It's built mobile-first and installs to your home screen like an app (PWA)." },
  { q: "Can I change my plan?", a: "Anytime. Edit your answers in settings and the plan recalculates instantly." },
];

// Static macro-ring for the hero mockup (no client JS needed).
function Ring({ pct, color, size = 54 }: { pct: number; color: string; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-200 dark:text-slate-700" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <span className="flex items-center gap-2 text-lg font-extrabold">
          <span className="text-brand-500">●</span> FitTrack
        </span>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">Log in</Link>
          <Link href="/signup" className="btn-primary">Get started</Link>
        </div>
      </header>

      {/* ---------- HERO BANNER ---------- */}
      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-8 md:pt-16">
        {/* animated glow blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-blob absolute -top-16 left-1/4 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="animate-blob animation-delay-2 absolute right-8 top-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="animate-blob animation-delay-4 absolute bottom-0 left-8 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl" />
        </div>

        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* copy */}
          <div className="text-center md:text-left">
            <span className="chip mb-4 inline-flex bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              <Activity className="h-3.5 w-3.5" /> Your pocket diet & training coach
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              A fitness plan built around{" "}
              <span className="animate-gradient bg-gradient-to-r from-brand-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                you
              </span>
              .
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-400 md:mx-0">
              Answer a few questions and get a personalized nutrition + workout plan you can track
              every day — with 100+ Indian &amp; global foods built in.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base shadow-lg shadow-brand-500/30">
                Create my free plan <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="btn-ghost px-6 py-3 text-base">I have an account</Link>
            </div>
            {/* trust chips */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 md:justify-start">
              <span className="flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-brand-500" /> Installs like an app</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand-500" /> Private & secure</span>
              <span className="flex items-center gap-1.5"><Flame className="h-4 w-4 text-brand-500" /> 800+ exercises</span>
            </div>
          </div>

          {/* phone mockup */}
          <div className="animate-float mx-auto w-full max-w-[300px]">
            <div className="glass p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500">Wednesday</p>
                  <p className="text-sm font-bold">Hi Aarav 👋</p>
                </div>
                <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">🔥 12-day streak</span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-1 text-center">
                {[
                  { l: "Cals", pct: 0.72, c: "#16bb5e" },
                  { l: "Protein", pct: 0.85, c: "#3b82f6" },
                  { l: "Carbs", pct: 0.55, c: "#f59e0b" },
                  { l: "Water", pct: 0.64, c: "#06b6d4" },
                ].map((r) => (
                  <div key={r.l} className="flex flex-col items-center gap-1">
                    <Ring pct={r.pct} color={r.c} />
                    <span className="text-[9px] text-slate-500">{r.l}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-brand-500/10 p-3">
                <p className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">TODAY'S WORKOUT</p>
                <p className="text-sm font-bold">Push Day 💪</p>
                <p className="text-[10px] text-slate-500">Chest · Shoulders · Triceps</p>
              </div>
              <div className="mt-3 space-y-1.5">
                {["Dal Tadka · 1 katori", "Roti ×2", "Paneer Tikka"].map((f, i) => (
                  <div key={f} className="flex items-center gap-2 rounded-lg bg-slate-100/70 px-2.5 py-1.5 dark:bg-slate-800/70">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${i < 2 ? "text-brand-500" : "text-slate-300 dark:text-slate-600"}`} />
                    <span className="text-[11px]">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card transition hover:-translate-y-1 hover:shadow-lg">
              <f.icon className="mb-3 h-8 w-8 text-brand-500" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center text-3xl font-bold">How it works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="card text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
                {s.n}
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="card flex items-start gap-3">
          <ShieldCheck className="h-7 w-7 shrink-0 text-brand-500" />
          <div>
            <h3 className="font-semibold">Built safely</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              {["Calorie safety floors so plans never go dangerously low", "Doctor-clearance gates for serious conditions", "Your data is private and stored securely"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h2 className="text-center text-3xl font-bold">FAQ</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="card">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-3xl px-5 py-12 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-blob absolute left-1/3 top-0 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
        </div>
        <h2 className="text-3xl font-bold">Ready to start?</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">It's free. Your plan is ready in minutes.</p>
        <Link href="/signup" className="btn-primary mx-auto mt-6 px-6 py-3 text-base shadow-lg shadow-brand-500/30">
          Get started <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mx-auto mt-8 max-w-xl">
          <MedicalDisclaimer />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-5 py-8 text-sm text-slate-500 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span>© {new Date().getFullYear()} FitTrack</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/medical-disclaimer" className="hover:underline">Medical disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
