import { requireProfile } from "@/lib/auth";
import { SideNav } from "@/components/SideNav";
import { BottomNav } from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOut } from "@/app/actions";
import { LogOut } from "lucide-react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  return (
    <div className="flex min-h-screen">
      <SideNav isAdmin={profile.role === "admin"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <span className="font-extrabold md:hidden"><span className="text-brand-500">●</span> FitTrack</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <form action={signOut}>
              <button className="btn-ghost !p-2.5" aria-label="Sign out"><LogOut className="h-5 w-5" /></button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-4 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
