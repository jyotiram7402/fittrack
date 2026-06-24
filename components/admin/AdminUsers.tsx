"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, ShieldCheck, Trash2 } from "lucide-react";
import { adminDeleteUser, setSuspended } from "@/app/(app)/admin/actions";
import type { Profile } from "@/lib/types";

export function AdminUsers({ users }: { users: Partial<Profile>[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const filtered = users.filter((u) => (u.full_name ?? "").toLowerCase().includes(q.toLowerCase()));

  return (
    <section className="card">
      <h2 className="mb-2 font-semibold">Users ({users.length})</h2>
      <input className="input mb-3" placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="space-y-1">
        {filtered.map((u) => (
          <div key={u.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50">
            <div className="min-w-0">
              <p className="truncate font-medium">{u.full_name || "(no name)"} {u.role === "admin" && <span className="chip bg-brand-100 text-brand-700">admin</span>}</p>
              <p className="text-xs text-slate-500">{u.goal ?? "—"} · joined {(u.created_at ?? "").slice(0, 10)} {u.suspended && <span className="text-red-500">· suspended</span>}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                title={u.suspended ? "Unsuspend" : "Suspend"}
                onClick={async () => { await setSuspended(u.id!, !u.suspended); router.refresh(); }}
                className={`rounded-lg p-2 ${u.suspended ? "text-brand-500" : "text-amber-500"}`}
              >
                {u.suspended ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              </button>
              <button
                title="Delete"
                onClick={async () => {
                  if (confirm(`Delete ${u.full_name || "this user"} permanently?`)) {
                    await adminDeleteUser(u.id!);
                    router.refresh();
                  }
                }}
                className="rounded-lg p-2 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-slate-400">No users found.</p>}
      </div>
    </section>
  );
}
