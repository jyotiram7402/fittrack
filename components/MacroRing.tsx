"use client";

// Animated SVG progress ring for a single macro / calorie / water target.
interface Props {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color?: string;
  size?: number;
}

export function MacroRing({ label, value, target, unit = "g", color = "#16bb5e", size = 96 }: Props) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-200 dark:text-slate-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold tabular-nums">{Math.round(value)}</span>
          <span className="text-[10px] text-slate-500">/ {Math.round(target)}{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
    </div>
  );
}
