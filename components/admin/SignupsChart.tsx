"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SignupsChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={24} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Area type="monotone" dataKey="count" stroke="#16bb5e" fill="#16bb5e33" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
