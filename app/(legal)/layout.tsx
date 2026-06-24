import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/" className="text-sm text-brand-600">← Back to FitTrack</Link>
      <article className="prose prose-slate mt-6 max-w-none dark:prose-invert [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mt-2 [&_p]:text-sm [&_p]:text-slate-600 dark:[&_p]:text-slate-400">
        {children}
      </article>
    </div>
  );
}
