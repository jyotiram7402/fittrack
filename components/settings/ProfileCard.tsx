"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Camera, Dumbbell, Loader2, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateProfileInfo } from "@/app/actions";

interface Props {
  fullName: string;
  goalLabel: string;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  occupation: string | null;
  gymName: string | null;
  avatarUrl: string | null;
}

export function ProfileCard(p: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = (p.fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Photo must be under 2 MB.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await updateProfileInfo({ avatar_url: data.publicUrl });
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Upload failed — did you run supabase/profile-update.sql?");
    } finally {
      setUploading(false);
    }
  }

  async function saveInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    const res = await updateProfileInfo({
      full_name: String(f.get("full_name") ?? p.fullName),
      occupation: String(f.get("occupation") ?? ""),
      gym_name: String(f.get("gym_name") ?? ""),
    });
    setSaving(false);
    if (!res.ok) setError(res.error ?? "Could not save");
    else {
      setEditing(false);
      router.refresh();
    }
  }

  return (
    <section className="card">
      <div className="flex items-start gap-4">
        {/* avatar */}
        <button
          onClick={() => fileRef.current?.click()}
          className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-brand-500/15"
          aria-label="Change profile photo"
        >
          {p.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatarUrl} alt={p.fullName} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-brand-600 dark:text-brand-400">
              {initials}
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/50 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />} change
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />

        {/* identity */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-bold">{p.fullName || "Your name"}</h2>
            <button onClick={() => setEditing((v) => !v)} className="text-slate-400 hover:text-brand-500" aria-label="Edit profile">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-slate-500">{p.goalLabel}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-slate-500">
            {p.occupation && (
              <span className="chip bg-slate-100 dark:bg-slate-800"><Briefcase className="h-3 w-3" /> {p.occupation}</span>
            )}
            {p.gymName && (
              <span className="chip bg-slate-100 dark:bg-slate-800"><Dumbbell className="h-3 w-3" /> {p.gymName}</span>
            )}
          </div>
        </div>
      </div>

      {/* stats from onboarding */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Age" value={p.age ? `${p.age} yr` : "—"} />
        <Stat label="Height" value={p.heightCm ? `${p.heightCm} cm` : "—"} />
        <Stat label="Weight" value={p.weightKg ? `${p.weightKg} kg` : "—"} />
      </div>

      {/* edit form */}
      {editing && (
        <form onSubmit={saveInfo} className="animate-fade-in mt-4 space-y-2">
          <input name="full_name" defaultValue={p.fullName} placeholder="Full name" className="input" maxLength={80} />
          <input name="occupation" defaultValue={p.occupation ?? ""} placeholder="Job / occupation (e.g. Software Engineer)" className="input" maxLength={60} />
          <input name="gym_name" defaultValue={p.gymName ?? ""} placeholder="Gym name (if you go to one)" className="input" maxLength={60} />
          <button className="btn-primary w-full" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save profile
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 py-2.5 dark:bg-slate-800/50">
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}
