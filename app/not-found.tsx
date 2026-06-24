import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl font-extrabold text-brand-500">404</div>
      <p className="mt-2 text-slate-500">We couldn't find that page.</p>
      <Link href="/" className="btn-primary mt-4">Back home</Link>
    </div>
  );
}
