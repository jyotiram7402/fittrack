// Instant skeleton while app pages fetch their data — makes navigation feel fast.
export default function AppLoading() {
  return (
    <div className="space-y-5">
      <div className="h-7 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="card">
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-20 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}
