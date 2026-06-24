import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-6xl px-5 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
          <span className="text-brand-500">●</span> FitTrack
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
