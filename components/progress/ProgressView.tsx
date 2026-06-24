"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Loader2 } from "lucide-react";
import { logWeight } from "@/app/actions";
import { todayStr } from "@/lib/date";

type WeightPt = { date: string; weight: number; waist: number | null };
type Range = "week" | "month";

export function ProgressView({
  weights,
  volume,
  diet,
  workoutDays,
  targets,
}: {
  weights: WeightPt[];
  volume: { date: string; volume: number }[];
  diet: { date: string; cals: number; protein: number }[];
  workoutDays: number;
  targets: { calories: number; protein: number };
}) {
  const router = useRouter();
  const [range, setRange] = useState<Range>("month");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = range === "week" ? 7 : 30;
  const cutoff = todayStr(new Date(Date.now() - days * 86400000));
  const fW = weights.filter((w) => w.date >= cutoff);
  const fV = volume.filter((v) => v.date >= cutoff);
  const fD = diet.filter((d) => d.date >= cutoff);

  const weightChange = useMemo(() => {
    if (fW.length < 2) return 0;
    return Math.round((fW[fW.length - 1].weight - fW[0].weight) * 10) / 10;
  }, [fW]);

  async function onLogWeight(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    setSaving(true);
    const res = await logWeight({
      weight_kg: Number(form.get("weight")),
      waist_cm: form.get("waist") ? Number(form.get("waist")) : null,
      log_date: String(form.get("date")),
    });
    setSaving(false);
    if (!res.ok) setError(res.error ?? "Could not save");
    else router.refresh();
  }

  function exportCsv() {
    const rows = [["date", "weight_kg", "waist_cm"], ...weights.map((w) => [w.date, w.weight, w.waist ?? ""])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fittrack-weight.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Progress</h1>
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(["week", "month"] as Range[]).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${range === r ? "bg-white shadow dark:bg-slate-700" : "text-slate-500"}`}>{r}</button>
          ))}
        </div>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Weight change" value={`${weightChange > 0 ? "+" : ""}${weightChange} kg`} />
        <Stat label="Workouts" value={`${workoutDays}`} sub="last 90d" />
        <Stat label="Logged days" value={`${fD.length}`} sub={range} />
      </div>

      {/* log weight */}
      <form onSubmit={onLogWeight} className="card space-y-3">
        <h2 className="font-semibold">Log weight</h2>
        <div className="grid grid-cols-3 gap-2">
          <input name="weight" type="number" step="0.1" placeholder="kg" className="input" required />
          <input name="waist" type="number" step="0.1" placeholder="waist cm" className="input" />
          <input name="date" type="date" defaultValue={todayStr()} className="input" required />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="btn-primary w-full" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save</button>
      </form>

      {/* weight chart */}
      <ChartCard title="Weight">
        {fW.length > 1 ? (
          <LineChart data={fW}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} hide={fW.length > 10} />
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10 }} width={30} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Line type="monotone" dataKey="weight" stroke="#16bb5e" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        ) : <Empty msg="Log at least 2 weigh-ins to see your trend." />}
      </ChartCard>

      {/* calories vs target */}
      <ChartCard title="Calories vs target">
        {fD.length > 0 ? (
          <BarChart data={fD}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} hide={fD.length > 10} />
            <YAxis tick={{ fontSize: 10 }} width={36} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            {targets.calories > 0 && <ReferenceLine y={targets.calories} stroke="#ef4444" strokeDasharray="4 4" />}
            <Bar dataKey="cals" fill="#16bb5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : <Empty msg="Tick foods on the Diet page to track adherence." />}
      </ChartCard>

      {/* workout volume */}
      <ChartCard title="Workout volume (reps × kg)">
        {fV.length > 0 ? (
          <BarChart data={fV}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} hide={fV.length > 10} />
            <YAxis tick={{ fontSize: 10 }} width={40} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : <Empty msg="Finish a workout to see volume." />}
      </ChartCard>

      <button onClick={exportCsv} className="btn-ghost w-full"><Download className="h-4 w-4" /> Export weight as CSV</button>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-slate-500">{label}{sub ? ` · ${sub}` : ""}</p>
    </div>
  );
}
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2 className="mb-2 font-semibold">{title}</h2>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">{children as any}</ResponsiveContainer>
      </div>
    </div>
  );
}
function Empty({ msg }: { msg: string }) {
  return <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">{msg}</div>;
}
