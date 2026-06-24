"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Home, LineChart, UtensilsCrossed } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/diet", label: "Diet", icon: UtensilsCrossed },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: LineChart },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
                active ? "text-brand-600 dark:text-brand-400" : "text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
