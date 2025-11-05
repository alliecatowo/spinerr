"use client";

import { useEffect } from "react";
import { Dashboard } from "@/components/layout/Dashboard";
import { VinylDisc } from "@/components/music/VinylDisc";
import { ToneArm } from "@/components/music/ToneArm";
import { NowPlaying } from "@/components/music/NowPlaying";
import { PlayerControls } from "@/components/music/PlayerControls";
import { Calendar } from "@/components/calendar/Calendar";
import { UpcomingEvents } from "@/components/calendar/UpcomingEvents";
import { usePlayerStore, useCalendarStore } from "@/lib/store";
import { mockTracks, mockEvents } from "@/lib/mock-data";
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
  const setPlaylist = usePlayerStore((state) => state.setPlaylist);
  const setTrack = usePlayerStore((state) => state.setTrack);

  // Calendar store
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const events = useCalendarStore((state) => state.events);
  const selectDate = useCalendarStore((state) => state.selectDate);
  const setEvents = useCalendarStore((state) => state.setEvents);

  // Custom hooks for player functionality
  usePlayerProgress(); // Auto-updates progress and handles track advancement
  useKeyboardShortcuts(); // Enables keyboard controls

  // Initialize playlist and events on mount
  useEffect(() => {
    setPlaylist(mockTracks);
    setTrack(mockTracks[0]);
    setEvents(mockEvents);
  }, [setPlaylist, setTrack, setEvents]);

  // Seek handler for PlayerControls
  const handleSeek = (newProgress: number) => {
    updateProgress(newProgress);
  };

  // If no track loaded yet, show loading state
  if (!currentTrack) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-gray-900 dark:text-white text-sm">Loading...</div>
      </div>
    );
  }

  // Music section - centered elegant layout
  const musicSection = (
    <div className="flex flex-col items-center justify-center gap-16 w-full max-w-[1200px] mx-auto px-8">
      {/* Vinyl Disc - Large and centered */}
      <div className="relative w-full max-w-[700px] aspect-square">
        <VinylDisc
          track={currentTrack}
          isPlaying={isPlaying}
          progress={progress}
          onPlayPause={isPlaying ? pause : play}
        />
        <ToneArm isPlaying={isPlaying} progress={progress} />
      </div>

      {/* Track Info + Controls - Below vinyl */}
      <div className="w-full max-w-[600px] flex flex-col gap-8">
        {/* Now Playing Info */}
        <div className="space-y-6">
          <NowPlaying track={currentTrack} isPlaying={isPlaying} />
        </div>

        {/* Player Controls */}
        <div className="space-y-4">
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

  // Calendar section - minimal
  const calendarSection = (
    <div className="flex flex-col gap-4 w-full sticky top-6">
      <Calendar
        selectedDate={selectedDate}
        events={events}
        onSelectDate={(date) => date && selectDate(date)}
      />
      <UpcomingEvents
        events={events}
        selectedDate={selectedDate}
        maxEvents={4}
      />
    </div>
  );

  return (
    <Dashboard musicSection={musicSection} calendarSection={calendarSection} />
  );
}
