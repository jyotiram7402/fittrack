"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="text-4xl">😵</div>
      <h1 className="mt-4 text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-500">An unexpected error occurred. Try again.</p>
      <button onClick={reset} className="btn-primary mt-4">Try again</button>
    </div>
  );
}
