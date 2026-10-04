"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Play } from "lucide-react";
import { Dashboard } from "@/components/layout/Dashboard";
import { VinylDisc } from "@/components/music/VinylDisc";
import { ToneArm } from "@/components/music/ToneArm";
import { LocalFilePicker } from "@/components/music/LocalFilePicker";
import { Button } from "@/components/ui/button";
import { usePlayerStore, useLibraryStore } from "@/lib/store";
import { usePlayerProgress, useKeyboardShortcuts, useFirstVisit } from "@/hooks";

export default function Home() {
  // Player store
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const progress = usePlayerStore((state) => state.progress);
  const needsGesture = usePlayerStore((state) => state.needsGesture);
  const play = usePlayerStore((state) => state.play);
  const pause = usePlayerStore((state) => state.pause);
  const loadAlbum = usePlayerStore((state) => state.loadAlbum);

  // Library store
  const albums = useLibraryStore((state) => state.albums);
  const recentlyPlayed = useLibraryStore((state) => state.recentlyPlayed);

  // Custom hooks for player functionality
  usePlayerProgress(); // Auto-updates progress and handles track advancement
  useKeyboardShortcuts(); // Enables keyboard controls
  useFirstVisit(); // Auto-start onboarding tour on first visit

  const hydrated = useSyncExternalStore(
    (onChange) => useLibraryStore.persist.onFinishHydration(onChange),
    () => useLibraryStore.persist.hasHydrated(),
    () => false,
  );
  const [stationFailed, setStationFailed] = useState(false);
  const started = useRef(false);

  const startStation = useCallback(async () => {
    setStationFailed(false);
    try {
      const { loadDefaultStation } = await import("@/lib/sources/default-station");
      loadAlbum(await loadDefaultStation());
    } catch {
      setStationFailed(true);
    }
  }, [loadAlbum]);

  // Reload saved calendar subscriptions (quietly; failures just leave it empty).
  useEffect(() => {
    void import("@/lib/calendar/sources").then(({ useCalendarSources, refreshSavedCalendars }) => {
      const run = () => void refreshSavedCalendars();
      if (useCalendarSources.persist.hasHydrated()) run();
      else useCalendarSources.persist.onFinishHydration(run);
    });
  }, []);

  // Landing: once saved state has loaded, resume the last record, or tune the
  // default station for first-time visitors (and anyone whose saved record was
  // local files, which cannot survive a reload).
  useEffect(() => {
    if (!hydrated || currentTrack || started.current) return;
    started.current = true;
    const saved = recentlyPlayed[0] || albums[0];
    const resumable =
      saved &&
      saved.tracks.length > 0 &&
      saved.provider !== "local" &&
      saved.provider !== "spotify" &&
      !saved.tracks.some((t) => t.id.startsWith("local-"));
    if (resumable) loadAlbum(saved);
    else void startStation();
  }, [hydrated, currentTrack, albums, recentlyPlayed, loadAlbum, startStation]);

  // Browsers block audio until the visitor interacts. If autoplay was refused,
  // the first tap or key press anywhere starts the music.
  useEffect(() => {
    if (!needsGesture) return;
    const go = () => play();
    window.addEventListener("pointerdown", go, { once: true, capture: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
      window.removeEventListener("pointerdown", go, { capture: true });
      window.removeEventListener("keydown", go);
    };
  }, [needsGesture, play]);

  // No record yet: tuning in to the default station, or it could not be reached.
  if (!currentTrack) {
    return (
      <Dashboard
        musicSection={
          <div className="flex flex-col items-center justify-center gap-4 w-full max-w-3xl mx-auto min-h-screen">
            {stationFailed ? (
              <>
                <div className="text-center px-6">
                  <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Couldn&apos;t tune in
                  </p>
                  <p className="text-sm text-gray-600 dark:text-neutral-400 max-w-sm mx-auto">
                    The music sources aren&apos;t answering right now. Try again, or play files from your computer.
                  </p>
                </div>
                <Button onClick={() => void startStation()}>Try again</Button>
                <LocalFilePicker size="lg" />
              </>
            ) : (
              <div role="status" className="flex flex-col items-center gap-4 text-gray-600 dark:text-neutral-400">
                <div
                  className="h-24 w-24 animate-spin rounded-full border-4 border-gray-300 border-t-purple-500 dark:border-neutral-700"
                  style={{ animationDuration: "1.8s" }}
                />
                <p className="text-sm">Tuning in&hellip;</p>
              </div>
            )}
          </div>
        }
      />
    );
  }

  // Music section - vinyl player takes up almost entire left half
  const musicSection = (
    // Size container: the record is a square as large as the smaller side,
    // so the tone arm (positioned against the square) stays on the record
    <div className="w-full h-full flex items-center justify-center" style={{ containerType: 'size' }}>
      <div className="relative" data-tour="vinyl-disc" style={{ width: '100cqmin', height: '100cqmin' }}>
        <VinylDisc
          track={currentTrack}
          isPlaying={isPlaying}
          progress={progress}
          onPlayPause={isPlaying ? pause : play}
        />
        <ToneArm isPlaying={isPlaying} progress={progress} />
        {needsGesture && !isPlaying && (
          <button
            type="button"
            onClick={play}
            className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-base font-semibold text-gray-900 shadow-xl backdrop-blur transition hover:scale-105 dark:bg-neutral-900/90 dark:text-white"
          >
            <Play className="h-5 w-5 fill-current" aria-hidden="true" />
            Tap to play
          </button>
        )}
      </div>
    </div>
  );

  return <Dashboard musicSection={musicSection} />;
}
