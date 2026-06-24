"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = String(new FormData(e.currentTarget).get("email"));
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="card text-center">
        <h1 className="text-xl font-bold">Check your email</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          If an account exists, a reset link is on its way.
        </p>
        <Link href="/login" className="btn-ghost mt-4 w-full">Back to login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Reset password</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">We'll email you a reset link.</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input name="email" type="email" placeholder="you@example.com" className="input" required />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-brand-600">Back to login</Link>
      </p>
    </div>
  );
}
