"use client";

import { X } from "lucide-react";
import { usePlayerStore } from "@/lib/store";

/** Shows why a track could not be played, instead of failing silently. */
export function PlaybackNotice() {
  const message = usePlayerStore((state) => state.playbackError);
  const clear = usePlayerStore((state) => state.setPlaybackError);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 flex w-[min(92vw,32rem)] -translate-x-1/2 items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg dark:border-amber-500/30 dark:bg-amber-950/90 dark:text-amber-50"
    >
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={() => clear(null)}
        className="rounded p-0.5 opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
