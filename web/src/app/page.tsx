"use client";

import { useEffect } from "react";
import { Dashboard } from "@/components/layout/Dashboard";
import { VinylDisc } from "@/components/music/VinylDisc";
import { ToneArm } from "@/components/music/ToneArm";
import { NowPlaying } from "@/components/music/NowPlaying";
import { PlayerControls } from "@/components/music/PlayerControls";
import { AtAGlance } from "@/components/layout/AtAGlance";
import { usePlayerStore, useCalendarStore, useLibraryStore } from "@/lib/store";
import { mockEvents } from "@/lib/mock-data";
import { usePlayerProgress, useKeyboardShortcuts } from "@/hooks";

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

  // Initialize with first album from library or recently played on mount
  useEffect(() => {
    // Set calendar events
    setEvents(mockEvents);

    // ALWAYS load first album on mount (so p5.js initializes immediately)
    const albumToLoad = recentlyPlayed[0] || albums[0];
    if (albumToLoad && albumToLoad.tracks.length > 0) {
      console.log('[Home] Auto-loading first album on mount:', albumToLoad.title);
      loadAlbum(albumToLoad);
    }
  }, []); // Only run once on mount

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
          <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[700px] mx-auto h-[60vh]">
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No music playing
              </p>
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                Add an album to your library to get started
              </p>
            </div>
          </div>
        }
        calendarSection={<AtAGlance />}
      />
    );
  }

  // Music section - compact single-screen layout with improved centering
  const musicSection = (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-[700px] mx-auto">
      {/* Vinyl Disc - Optimized size for better visual prominence */}
      <div className="relative w-full max-w-[500px] aspect-square">
        <VinylDisc
          track={currentTrack}
          isPlaying={isPlaying}
          progress={progress}
          onPlayPause={isPlaying ? pause : play}
        />
        <ToneArm isPlaying={isPlaying} progress={progress} />
      </div>

      {/* Track Info + Controls - Compact below vinyl */}
      <div className="w-full max-w-[500px] flex flex-col gap-3">
        {/* Now Playing Info */}
        <div>
          <NowPlaying track={currentTrack} isPlaying={isPlaying} />
        </div>

        {/* Player Controls */}
        <div>
          <PlayerControls
            isPlaying={isPlaying}
            progress={progress}
            volume={volume}
            duration={currentTrack.duration}
            onPlay={play}
            onPause={pause}
            onNext={nextTrack}
            onPrev={prevTrack}
            onSeek={handleSeek}
            onVolumeChange={setVolume}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Dashboard musicSection={musicSection} calendarSection={<AtAGlance />} />
  );
}
