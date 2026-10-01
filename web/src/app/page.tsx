"use client";

import { useEffect } from "react";
import { Dashboard } from "@/components/layout/Dashboard";
import { VinylDisc } from "@/components/music/VinylDisc";
import { ToneArm } from "@/components/music/ToneArm";
import { LocalFilePicker } from "@/components/music/LocalFilePicker";
import { SOUNDCLOUD_AVAILABLE } from "@/lib/runtime";
import { usePlayerStore, useCalendarStore, useLibraryStore } from "@/lib/store";
import { mockEvents } from "@/lib/mock-data";
import { usePlayerProgress, useKeyboardShortcuts, useFirstVisit } from "@/hooks";

export default function Home() {
  // Player store
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const progress = usePlayerStore((state) => state.progress);
  const volume = usePlayerStore((state) => state.volume);
  const play = usePlayerStore((state) => state.play);
  const pause = usePlayerStore((state) => state.pause);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const prevTrack = usePlayerStore((state) => state.prevTrack);
  const updateProgress = usePlayerStore((state) => state.updateProgress);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const loadAlbum = usePlayerStore((state) => state.loadAlbum);

  // Library store
  const albums = useLibraryStore((state) => state.albums);
  const recentlyPlayed = useLibraryStore((state) => state.recentlyPlayed);

  // Calendar store
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const events = useCalendarStore((state) => state.events);
  const selectDate = useCalendarStore((state) => state.selectDate);
  const setEvents = useCalendarStore((state) => state.setEvents);

  // Custom hooks for player functionality
  usePlayerProgress(); // Auto-updates progress and handles track advancement
  useKeyboardShortcuts(); // Enables keyboard controls
  useFirstVisit(); // Auto-start onboarding tour on first visit

  // Initialize calendar events
  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  // Auto-load most recent album after store rehydration
  useEffect(() => {
    // Only auto-load if no track is currently loaded
    if (currentTrack) {
      console.log('[Home] Track already loaded, skipping auto-load');
      return;
    }

    // Wait for store rehydration (albums/recentlyPlayed populated)
    if (recentlyPlayed.length === 0 && albums.length === 0) {
      console.log('[Home] Waiting for store rehydration...');
      return;
    }

    const albumToLoad = recentlyPlayed[0] || albums[0];
    if (albumToLoad && albumToLoad.tracks.length > 0) {
      console.log('[Home] Auto-loading most recent album:', albumToLoad.title);
      loadAlbum(albumToLoad);
    } else {
      console.warn('[Home] No albums found in library to auto-load');
    }
  }, [recentlyPlayed, albums, currentTrack]); // Re-run when store rehydrates

  // Seek handler for PlayerControls
  const handleSeek = (newProgress: number) => {
    updateProgress(newProgress);
    // Also seek the audio player
    if (typeof window !== 'undefined') {
      import('@/lib/audio-player').then(({ getAudioPlayer }) => {
        getAudioPlayer().seek(newProgress);
      });
    }
  };

  // If no track loaded yet, show empty state
  if (!currentTrack) {
    return (
      <Dashboard
        musicSection={
          <div className="flex flex-col items-center justify-center gap-4 w-full max-w-3xl mx-auto min-h-screen">
            <div className="text-center px-6">
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No music playing
              </p>
              <p className="text-sm text-gray-600 dark:text-neutral-400 max-w-sm mx-auto">
                {SOUNDCLOUD_AVAILABLE
                  ? "Pick some audio files from your computer, or use Add Album to search SoundCloud."
                  : "Pick some audio files from your computer. They play right here in your browser and are never uploaded."}
              </p>
            </div>
            <LocalFilePicker size="lg" />
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
      </div>
    </div>
  );

  return <Dashboard musicSection={musicSection} />;
}
