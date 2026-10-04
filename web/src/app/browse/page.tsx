"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Disc3, Globe, Loader2, Pause, Play, Radio, Sparkles, TrendingUp, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { usePlayerStore, useLibraryStore } from "@/lib/store";
import { SECTIONS, STATIONS, loadStation, type BrowseSection, type Station } from "@/lib/sources/browse";

const SECTION_ICON: Record<BrowseSection, typeof Sparkles> = {
  moods: Sparkles,
  trending: TrendingUp,
  radio: Radio,
  archive: Archive,
};

// Dark, purple-led tiles; each section gets its own hue so they read apart.
const SECTION_TILE: Record<BrowseSection, string> = {
  moods: "from-purple-600/90 to-fuchsia-800/90",
  trending: "from-violet-600/90 to-indigo-800/90",
  radio: "from-purple-700/90 to-neutral-800",
  archive: "from-neutral-700 to-purple-900/90",
};

export default function BrowsePage() {
  const router = useRouter();
  const [section, setSection] = useState<BrowseSection>("moods");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const loadAlbum = usePlayerStore((s) => s.loadAlbum);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const addToRecentlyPlayed = useLibraryStore((s) => s.addToRecentlyPlayed);

  const stations = STATIONS.filter((s) => s.section === section);
  const info = SECTIONS.find((s) => s.id === section)!;

  const start = async (station: Station) => {
    const request = ++requestRef.current;
    setBusyId(station.id);
    setError(null);
    try {
      const album = await loadStation(station);
      if (request !== requestRef.current) return; // a newer tap won
      loadAlbum(album);
      addToRecentlyPlayed(album);
      router.push("/");
    } catch (e) {
      if (request !== requestRef.current) return;
      setError(e instanceof Error ? e.message : "Couldn't load that station. Try another.");
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-28 dark:bg-neutral-950">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} aria-label="Back to the player">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="flex-1 text-xl font-bold text-gray-900 dark:text-white">Browse</h1>
          <ThemeToggle />
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-3">
          <div role="tablist" aria-label="Station types" className="grid grid-cols-4 gap-1 rounded-lg bg-gray-100 p-1 dark:bg-neutral-900">
            {SECTIONS.map((s) => {
              const Icon = SECTION_ICON[s.id];
              const active = s.id === section;
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setSection(s.id);
                    setError(null);
                  }}
                  className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-xs font-medium transition-colors sm:flex-row sm:gap-2 sm:text-sm ${
                    active
                      ? "bg-purple-600 text-white shadow"
                      : "text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-5">
        <p className="mb-4 text-sm text-gray-600 dark:text-neutral-400">{info.blurb} Tap one to start playing.</p>

        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {stations.map((station) => {
            const busy = busyId === station.id;
            const Icon = station.kind === "radio-country" ? Globe : SECTION_ICON[station.section];
            return (
              <li key={station.id}>
                <button
                  onClick={() => void start(station)}
                  disabled={busyId !== null && !busy}
                  className={`group relative flex h-28 w-full flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br p-3 text-left text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50 sm:h-32 ${SECTION_TILE[station.section]}`}
                >
                  <Disc3 className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 text-white/10 transition-transform group-hover:rotate-45" aria-hidden="true" />
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Loading" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <span>
                    <span className="block text-base font-semibold leading-tight">{station.title}</span>
                    <span className="block text-xs text-white/75">{busy ? "Tuning in…" : station.subtitle}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </main>

      {currentTrack && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <button onClick={() => router.push("/")} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label="Back to the player">
              <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-purple-800">
                {currentTrack.artworkUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentTrack.artworkUrl} alt="" className="h-full w-full object-cover" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{currentTrack.title}</span>
                <span className="block truncate text-xs text-gray-600 dark:text-neutral-400">{currentTrack.artist}</span>
              </span>
            </button>
            <Button size="icon" onClick={isPlaying ? pause : play} aria-label={isPlaying ? "Pause" : "Play"} className="h-11 w-11 rounded-full bg-purple-600 text-white hover:bg-purple-700">
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
