"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  Home,
  Library,
  LineChart,
  ListChecks,
  Menu,
  Settings,
  Shield,
  UtensilsCrossed,
  X,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/diet", label: "Diet", icon: UtensilsCrossed },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: LineChart },
];

const moreItems = [
  { href: "/exercises", label: "Exercise Library", icon: Library },
  { href: "/plan", label: "My Plan", icon: ListChecks },
  { href: "/settings", label: "Settings & Profile", icon: Settings },
];

export function BottomNav({ isAdmin }: { isAdmin?: boolean }) {
  const path = usePathname();
  const [more, setMore] = useState(false);
  const moreActive = [...moreItems.map((m) => m.href), "/admin"].some((h) => path.startsWith(h));

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {items.map(({ href, label, icon: Icon }) => {
            const active = path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMore(false)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
                  active ? "text-brand-600 dark:text-brand-400" : "text-slate-500"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => setMore((m) => !m)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
              more || moreActive ? "text-brand-600 dark:text-brand-400" : "text-slate-500"
            }`}
            aria-label="More options"
          >
            {more ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            More
          </button>
        </div>
      </nav>

      {/* More sheet */}
      {more && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMore(false)}>
          <div
            className="animate-fade-in absolute inset-x-3 bottom-20 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {moreItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMore(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium ${
                  path.startsWith(href)
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                <Icon className="h-5 w-5" /> {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMore(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                <Shield className="h-5 w-5" /> Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
