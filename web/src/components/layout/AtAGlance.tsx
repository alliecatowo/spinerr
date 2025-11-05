"use client";

import { motion } from "framer-motion";
import { format, isToday, isTomorrow } from "date-fns";
import { Play, Pause } from "lucide-react";
import { usePlayerStore, useCalendarStore } from "@/lib/store";
import type { CalendarEvent } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";

// Helper function for event date labels (outside component so EventItem can use it)
function getEventDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

export function AtAGlance() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const progress = usePlayerStore((state) => state.progress);
  const play = usePlayerStore((state) => state.play);
  const pause = usePlayerStore((state) => state.pause);
  const updateProgress = usePlayerStore((state) => state.updateProgress);
  const events = useCalendarStore((state) => state.events);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Get next 2-3 upcoming events
  const upcomingEvents = events
    .filter((event) => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (newProgress: number) => {
    updateProgress(newProgress);
    if (typeof window !== "undefined") {
      import("@/lib/audio-player").then(({ getAudioPlayer }) => {
        getAudioPlayer().seek(newProgress);
      });
    }
  };

  const currentDuration = currentTrack ? progress * currentTrack.duration : 0;
  const totalDuration = currentTrack?.duration || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full lg:min-w-[400px] lg:max-w-[440px] sticky top-6"
    >
      <div className="rounded-xl border border-gray-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 space-y-6">
        {/* Time Section */}
        <div className="space-y-1">
          <div className="text-4xl font-semibold text-gray-900 dark:text-white tabular-nums">
            {format(currentTime, "h:mm a")}
          </div>
          <div className="text-sm text-gray-600 dark:text-neutral-400">
            {format(currentTime, "EEEE, MMMM d, yyyy")}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-neutral-800" />

        {/* Upcoming Events */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wide">
            Upcoming
          </h3>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 dark:text-neutral-600 py-2">
              No upcoming events
            </div>
          )}
        </div>

        {/* Divider */}
        {currentTrack && <div className="h-px bg-gray-200 dark:bg-neutral-800" />}

        {/* Now Playing Section */}
        {currentTrack && (
          <div className="space-y-4">
            <h3 className="text-xs font-medium text-gray-500 dark:text-neutral-500 uppercase tracking-wide">
              Now Playing
            </h3>

            {/* Song Info */}
            <div className="space-y-1">
              <div className="text-base font-semibold text-gray-900 dark:text-white truncate">
                {currentTrack.title}
              </div>
              <div className="text-sm text-gray-600 dark:text-neutral-400 truncate">
                {currentTrack.artist}
              </div>
            </div>

            {/* Seek Bar */}
            <div className="space-y-2">
              <Slider
                value={[progress * 100]}
                onValueChange={(value) => handleSeek(value[0] / 100)}
                max={100}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-neutral-500 tabular-nums">
                <span>{formatTime(currentDuration)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* Play/Pause Button */}
            <div className="flex justify-center pt-2">
              <Button
                variant="default"
                size="icon"
                onClick={isPlaying ? pause : play}
                className="h-12 w-12"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EventItem({ event }: { event: CalendarEvent }) {
  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "appointment":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "birthday":
        return "bg-pink-500/10 text-pink-700 dark:text-pink-400";
      case "reminder":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="flex items-start gap-3 py-2">
      <div
        className={`shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${
          event.type === "meeting"
            ? "bg-blue-500"
            : event.type === "appointment"
            ? "bg-green-500"
            : event.type === "birthday"
            ? "bg-pink-500"
            : "bg-amber-500"
        }`}
      />
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {event.title}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-neutral-400">
          <span>{getEventDateLabel(event.date)}</span>
          <span>•</span>
          <span>{event.time}</span>
        </div>
      </div>
    </div>
  );
}
