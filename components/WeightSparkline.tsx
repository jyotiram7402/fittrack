"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";

export function WeightSparkline({ data }: { data: { date: string; weight: number }[] }) {
  return (
    <div className="mt-3 h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
          <Tooltip
            formatter={(v: number) => [`${v} kg`, "Weight"]}
            labelFormatter={(l) => l}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Line type="monotone" dataKey="weight" stroke="#16bb5e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
