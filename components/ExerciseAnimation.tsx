"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { imageUrl } from "@/lib/exercises";

// Alternates the two frames (start/end) of a free-exercise-db exercise to
// fake an animation. Play/pause toggle. Falls back gracefully to one frame.
export function ExerciseAnimation({
  images,
  alt,
  className = "",
  intervalMs = 700,
}: {
  images: string[];
  alt: string;
  className?: string;
  intervalMs?: number;
}) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const hasTwo = images.length > 1;

  useEffect(() => {
    if (!playing || !hasTwo) return;
    const t = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), intervalMs);
    return () => clearInterval(t);
  }, [playing, hasTwo, intervalMs]);

  if (!images.length) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-slate-200 text-slate-400 dark:bg-slate-800 ${className}`}>
        No image
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-white ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl(images[frame] ?? images[0])}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      {hasTwo && (
        <button
          onClick={() => setPlaying((p) => !p)}
          className="absolute bottom-2 right-2 rounded-full bg-black/60 p-2 text-white backdrop-blur"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
