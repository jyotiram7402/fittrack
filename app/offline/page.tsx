export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl">📶</div>
      <h1 className="mt-4 text-2xl font-bold">You're offline</h1>
      <p className="mt-2 max-w-sm text-slate-500">
        FitTrack needs a connection to sync your data. Your cached plan and exercises are still
        viewable — reconnect to log today.
      </p>
    </div>
  );
}
