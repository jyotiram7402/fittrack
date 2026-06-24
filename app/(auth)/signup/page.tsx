"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signupSchema } from "@/lib/validation";
import { GoogleButton } from "@/components/GoogleButton";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse({
      fullName: form.get("fullName"),
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setDone(true);
  }

  if (done) {
    return (
      <div className="card text-center">
        <h1 className="text-xl font-bold">Check your inbox 📧</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          We sent you a verification link. Click it to activate your account, then log in.
        </p>
        <Link href="/login" className="btn-primary mt-4 w-full">Go to login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Free forever to get started.</p>

      <GoogleButton next="/onboarding" />

      <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" /> or <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" className="input" autoComplete="name" required />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="input" autoComplete="new-password" required minLength={8} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign up
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600">Log in</Link>
      </p>
      <p className="mt-3 text-center text-xs text-slate-400">
        By signing up you agree to our{" "}
        <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
