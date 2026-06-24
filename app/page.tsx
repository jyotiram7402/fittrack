import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  HeartPulse,
  LineChart,
  Salad,
  ShieldCheck,
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";

const features = [
  { icon: Salad, title: "Personalized macros", desc: "Calories, protein, carbs, fat & water tuned to your body and goal." },
  { icon: Dumbbell, title: "Smart workout splits", desc: "Auto-built training plan with ~800 exercises and animations." },
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

export default function LandingPage() {
  return (
    <div className="min-h-screen">
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

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-10 text-center md:pt-20">
        <span className="chip mx-auto mb-4 bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          <Activity className="h-3.5 w-3.5" /> Your pocket diet & training coach
        </span>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
          A fitness plan built around <span className="text-brand-500">you</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-400">
          Answer a few questions and get a personalized nutrition + workout plan you can track every
          day — adapted to your goal, body, and health conditions.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup" className="btn-primary px-6 py-3 text-base">
            Create my free plan <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="btn-ghost px-6 py-3 text-base">I already have an account</Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card">
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
      <section className="mx-auto max-w-3xl px-5 py-12 text-center">
        <h2 className="text-3xl font-bold">Ready to start?</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">It's free. Your plan is ready in minutes.</p>
        <Link href="/signup" className="btn-primary mx-auto mt-6 px-6 py-3 text-base">
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
