"use client";

import { motion } from "framer-motion";
import { format, isToday, isTomorrow } from "date-fns";
import { usePlayerStore, useCalendarStore } from "@/lib/store";
import type { CalendarEvent } from "@/lib/store";
import { useEffect, useState } from "react";

// Helper function for event date labels (outside component so EventItem can use it)
function getEventDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

export function AtAGlance() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-8 right-8 z-30 space-y-8"
    >
      {/* Prominent Clock - Floating */}
      <div className="text-right space-y-2">
        <div className="flex items-baseline justify-end gap-1">
          <span className="text-7xl font-light text-gray-900 dark:text-white tabular-nums tracking-tight">
            {format(currentTime, "h:mm")}
          </span>
          <span className="text-2xl font-light text-gray-500 dark:text-neutral-500 tracking-wide uppercase">
            {format(currentTime, "a")}
          </span>
        </div>
        <div className="text-sm text-gray-400 dark:text-neutral-600">
          {format(currentTime, "EEEE, MMMM d")}
        </div>
      </div>

      {/* Upcoming Events - Minimal */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-3 max-w-xs">
          {upcomingEvents.slice(0, 2).map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-right space-y-0.5"
            >
              <div className="text-sm font-medium text-gray-700 dark:text-neutral-300 truncate">
                {event.title}
              </div>
              <div className="text-xs text-gray-400 dark:text-neutral-600">
                {getEventDateLabel(event.date)} • {event.time}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Now Playing - Minimal */}
      {currentTrack && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-right space-y-1 max-w-xs"
        >
          <div className="text-xs text-gray-400 dark:text-neutral-600 uppercase tracking-wider">
            Now Playing
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-neutral-300 truncate">
            {currentTrack.title}
          </div>
          <div className="text-xs text-gray-500 dark:text-neutral-500 truncate">
            {currentTrack.artist}
          </div>
        </motion.div>
      )}
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
