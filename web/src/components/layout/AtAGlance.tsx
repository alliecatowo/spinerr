"use client";

import { format, isToday, isTomorrow } from "date-fns";
import { usePlayerStore, useCalendarStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { PlayerControls } from "@/components/music/PlayerControls";

function getEventDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

interface AtAGlanceProps {
  onSeek?: (progress: number) => void;
}

/**
 * At A Glance - Minimal display with integrated controls
 */
export function AtAGlance({ onSeek }: AtAGlanceProps) {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const progress = usePlayerStore((state) => state.progress);
  const volume = usePlayerStore((state) => state.volume);
  const play = usePlayerStore((state) => state.play);
  const pause = usePlayerStore((state) => state.pause);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const prevTrack = usePlayerStore((state) => state.prevTrack);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const updateProgress = usePlayerStore((state) => state.updateProgress);
  const events = useCalendarStore((state) => state.events);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Get next 2 upcoming events
  const upcomingEvents = events
    .filter((event) => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 2);

  const handleSeek = (newProgress: number) => {
    updateProgress(newProgress);
    if (typeof window !== 'undefined') {
      import('@/lib/audio-player').then(({ getAudioPlayer }) => {
        getAudioPlayer().seek(newProgress);
      });
    }
  };

  return (
    <div className="text-center space-y-10">
      {/* Clock */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-9xl font-light text-gray-900 dark:text-white tabular-nums tracking-tight">
            {format(currentTime, "h:mm")}
          </span>
          <span className="text-4xl font-light text-gray-500 dark:text-neutral-400 uppercase tracking-wide">
            {format(currentTime, "a")}
          </span>
        </div>
        <div className="text-lg text-gray-500 dark:text-neutral-500 font-light">
          {format(currentTime, "EEEE, MMMM d")}
        </div>
      </div>

      {/* Now Playing - More Prominent */}
      {currentTrack && (
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="text-xs text-gray-500 dark:text-neutral-500 uppercase tracking-widest font-medium">
              Now Playing
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white leading-tight">
              {currentTrack.title}
            </div>
            <div className="text-lg text-gray-600 dark:text-neutral-400">
              {currentTrack.artist}
            </div>
          </div>

          {/* Player Controls - Integrated below Now Playing */}
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
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-5">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="space-y-1.5">
              <div className="text-base font-medium text-gray-800 dark:text-neutral-200">
                {event.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-neutral-500">
                {getEventDateLabel(event.date)} • {event.time}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
