"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  Home,
  LineChart,
  ListChecks,
  Settings,
  Shield,
  UtensilsCrossed,
  Library,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/diet", label: "Diet", icon: UtensilsCrossed },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/exercises", label: "Exercises", icon: Library },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/plan", label: "My Plan", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SideNav({ isAdmin }: { isAdmin?: boolean }) {
  const path = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-slate-200 p-4 dark:border-slate-800 md:flex">
      <Link href="/dashboard" className="mb-4 flex items-center gap-2 px-2 text-lg font-extrabold">
        <span className="text-brand-500">●</span> FitTrack
      </Link>
      {items.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          href="/admin"
          className={`mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
            path.startsWith("/admin")
              ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <Shield className="h-5 w-5" /> Admin
        </Link>
      )}
    </aside>
  );
}
