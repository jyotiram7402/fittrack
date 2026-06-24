import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="card text-center">
      <MailCheck className="mx-auto h-10 w-10 text-brand-500" />
      <h1 className="mt-3 text-xl font-bold">Verify your email</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        We sent a verification link to your inbox. Click it to activate your account, then log in.
      </p>
      <Link href="/login" className="btn-primary mt-4 w-full">Go to login</Link>
    </div>
  );
}
