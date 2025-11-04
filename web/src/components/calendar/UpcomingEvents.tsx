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
        "relative flex h-full flex-col rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl",
        className
      )}
    >
      {/* Header */}
      <div className="border-b border-white/5 p-6">
        <h2 className="text-lg font-semibold text-white/90">Upcoming Events</h2>
        <p className="mt-1 text-sm text-white/50">
          Next {maxEvents} events on your calendar
        </p>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          <AnimatePresence mode="popLayout">
            {groupedEvents.length > 0 ? (
              <div className="space-y-6">
                {groupedEvents.map((group) => {
                  const dateKey = format(group.date, "yyyy-MM-dd")
                  const isHighlighted = dateKey === highlightDate

                  return (
                    <motion.div
                      key={dateKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      {/* Date Header */}
                      <motion.div
                        initial={{ opacity: 0.7 }}
                        animate={{
                          opacity: isHighlighted ? 1 : 0.7,
                          scale: isHighlighted ? 1.02 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "sticky top-0 z-10 flex items-center gap-2 rounded-lg px-3 py-2 backdrop-blur-xl transition-all duration-200",
                          isHighlighted
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 ring-1 ring-white/20"
                            : "bg-white/5"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4 text-white/50" />
                        <span className="text-sm font-medium text-white/90">
                          {format(group.date, "EEEE, MMMM d")}
                        </span>
                        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                          {group.events.length}
                        </span>
                      </motion.div>

                      {/* Events for this date */}
                      <div className="space-y-2">
                        {group.events.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col items-center justify-center space-y-4 py-12"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10">
                  <CalendarIcon className="h-10 w-10 text-white/30" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-white/70">No upcoming events</h3>
                  <p className="mt-1 text-sm text-white/40">
                    Your calendar is clear for now
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Ambient glow effect */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
    </div>
  )
}
