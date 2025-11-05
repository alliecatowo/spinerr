"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, isSameDay, isAfter, startOfDay } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { EventCard } from "./EventCard"
import type { CalendarEvent } from "./Calendar"

interface UpcomingEventsProps {
  events?: CalendarEvent[]
  selectedDate?: Date
  maxEvents?: number
  className?: string
}

export function UpcomingEvents({
  events = [],
  selectedDate,
  maxEvents = 7,
  className,
}: UpcomingEventsProps) {
  // Filter and sort upcoming events
  const upcomingEvents = React.useMemo(() => {
    const now = startOfDay(new Date())

    return events
      .filter((event) => {
        const eventDate = startOfDay(event.date)
        return isAfter(eventDate, now) || isSameDay(eventDate, now)
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, maxEvents)
  }, [events, maxEvents])

  // Group events by date
  const groupedEvents = React.useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>()

    upcomingEvents.forEach((event) => {
      const dateKey = format(event.date, "yyyy-MM-dd")
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(event)
    })

    return Array.from(groups.entries()).map(([date, events]) => ({
      date: new Date(date),
      events,
    }))
  }, [upcomingEvents])

  // Highlight selected date events
  const highlightDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900",
        className
      )}
    >
      {/* Header - more minimal */}
      <div className="border-b border-gray-100 dark:border-neutral-800 px-4 py-3">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white">Upcoming</h2>
      </div>

      {/* Events List */}
      <div className="px-4 py-3 space-y-3">
        <AnimatePresence mode="popLayout">
          {groupedEvents.length > 0 ? (
            <>
              {groupedEvents.map((group) => {
                const dateKey = format(group.date, "yyyy-MM-dd")
                const isHighlighted = dateKey === highlightDate

                return (
                  <motion.div
                    key={dateKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {/* Date Header - ultra minimal */}
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-neutral-400">
                        {format(group.date, "EEE, MMM d")}
                      </span>
                      <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800" />
                    </div>

                    {/* Events for this date */}
                    <div className="space-y-1.5">
                      {group.events.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center space-y-2 py-12"
            >
              <CalendarIcon className="h-10 w-10 text-gray-300 dark:text-neutral-700" />
              <p className="text-xs text-gray-400 dark:text-neutral-600">
                No upcoming events
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
