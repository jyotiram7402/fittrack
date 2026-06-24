import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { todayStr } from "@/lib/queries";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { SignupsChart } from "@/components/admin/SignupsChart";
import { GOAL_LABELS } from "@/lib/constants";
import type { Profile } from "@/lib/types";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  await requireAdmin();
  const admin = createServiceClient();
  const { data } = await admin
    .from("profiles")
    .select("id, full_name, role, goal, suspended, onboarding_complete, created_at")
    .order("created_at", { ascending: false });
  const profiles = (data as Partial<Profile>[]) ?? [];

  const total = profiles.length;
  const since = (days: number) => todayStr(new Date(Date.now() - days * 86400000));
  const new7 = profiles.filter((p) => (p.created_at ?? "") >= since(7)).length;
  const new30 = profiles.filter((p) => (p.created_at ?? "") >= since(30)).length;
  const active = profiles.filter((p) => p.onboarding_complete).length;

  // Goal distribution
  const goalDist: Record<string, number> = {};
  for (const p of profiles) if (p.goal) goalDist[p.goal] = (goalDist[p.goal] ?? 0) + 1;

  // Signups over last 30 days
  const byDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) byDay.set(since(i), 0);
  for (const p of profiles) {
    const d = (p.created_at ?? "").slice(0, 10);
    if (byDay.has(d)) byDay.set(d, (byDay.get(d) ?? 0) + 1);
  }
  const signups = [...byDay.entries()].map(([date, count]) => ({ date: date.slice(5), count }));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Admin</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Total users" value={total} />
        <Kpi label="New (7d)" value={new7} />
        <Kpi label="New (30d)" value={new30} />
        <Kpi label="Onboarded" value={active} />
      </div>

      <section className="card">
        <h2 className="mb-2 font-semibold">Signups (last 30 days)</h2>
        <SignupsChart data={signups} />
      </section>

      <section className="card">
        <h2 className="mb-2 font-semibold">Goal distribution</h2>
        <div className="space-y-2">
          {Object.entries(goalDist).map(([g, n]) => (
            <div key={g}>
              <div className="flex justify-between text-sm"><span>{GOAL_LABELS[g as keyof typeof GOAL_LABELS] ?? g}</span><span>{n}</span></div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-brand-500" style={{ width: `${(n / total) * 100}%` }} /></div>
            </div>
          ))}
          {total === 0 && <p className="text-sm text-slate-400">No users yet.</p>}
        </div>
      </section>

      <AdminUsers users={profiles} />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
