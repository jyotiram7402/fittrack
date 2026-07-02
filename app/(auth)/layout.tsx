import Link from "next/link";
import { Activity, Bike, Dumbbell, Flame, HeartPulse, Trophy } from "lucide-react";

// Animated gym-themed backdrop: gradient glow blobs + floating equipment icons.
// Pure CSS/SVG — zero image downloads, so it stays fast on mobile.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-100/60 via-transparent to-cyan-100/40 dark:from-brand-900/30 dark:to-cyan-900/20" />
        <div className="animate-blob absolute -left-20 top-10 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="animate-blob animation-delay-2 absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="animate-blob animation-delay-4 absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

        {/* floating gym icons */}
        <Dumbbell className="animate-float absolute left-[8%] top-[18%] h-10 w-10 rotate-12 text-brand-500/30" />
        <HeartPulse className="animate-float-slow absolute right-[10%] top-[14%] h-9 w-9 text-red-500/25" />
        <Flame className="animate-float absolute bottom-[22%] left-[12%] h-8 w-8 text-amber-500/30" />
        <Bike className="animate-float-slow absolute bottom-[16%] right-[14%] h-10 w-10 -rotate-6 text-cyan-500/25" />
        <Trophy className="animate-float absolute right-[26%] top-[42%] hidden h-8 w-8 text-yellow-500/25 md:block" />
        <Activity className="animate-float-slow absolute left-[24%] top-[48%] hidden h-8 w-8 text-brand-400/25 md:block" />
      </div>

      <header className="mx-auto w-full max-w-6xl px-5 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
          <span className="text-brand-500">●</span> FitTrack
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-8">
        <div className="glass w-full max-w-sm p-6 animate-fade-in">{children}</div>
      </main>

      <p className="pb-6 text-center text-xs text-slate-400">
        Train hard. Eat smart. Track everything. 💪
      </p>
    </div>
  );
}
