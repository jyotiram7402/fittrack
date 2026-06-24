import { AlertTriangle } from "lucide-react";

export function MedicalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200 ${className}`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        This is general fitness &amp; nutrition information, <strong>not medical advice</strong>.
        These targets are a starting point — adjust based on real results, and consult a qualified
        professional, especially if you have a health condition.
      </p>
    </div>
  );
}
