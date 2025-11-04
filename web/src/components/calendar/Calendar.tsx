"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarPrimitive } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: "meeting" | "appointment" | "birthday" | "reminder"
  time?: string
  description?: string
}

interface CalendarProps {
  selectedDate?: Date
  events?: CalendarEvent[]
  onSelectDate?: (date: Date | undefined) => void
  className?: string
}

export function Calendar({
  selectedDate,
  events = [],
  onSelectDate,
  className,
}: CalendarProps) {
  // Get dates that have events
  const eventDates = React.useMemo(() => {
    const dates = new Set<string>()
    events.forEach((event) => {
      dates.add(format(event.date, "yyyy-MM-dd"))
    })
    return dates
  }, [events])

  // Check if a date has events
  const hasEvents = (date: Date) => {
    return eventDates.has(format(date, "yyyy-MM-dd"))
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl",
        className
      )}
    >
      <CalendarPrimitive
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        className="w-full"
        modifiers={{
          hasEvents: (date) => hasEvents(date),
        }}
        modifiersClassNames={{
          hasEvents: "relative",
        }}
        components={{
          DayButton: ({ day, modifiers, ...props }) => {
            const showDot = hasEvents(day.date)

            return (
              <button
                type="button"
                className={cn(
                  "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-white/10 hover:scale-105",
                  modifiers.selected &&
                    "bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/20",
                  modifiers.today &&
                    !modifiers.selected &&
                    "bg-white/5 font-semibold text-white ring-1 ring-white/10",
                  modifiers.outside && "text-white/30",
                  modifiers.disabled && "opacity-30 cursor-not-allowed",
                  !modifiers.selected &&
                    !modifiers.today &&
                    !modifiers.outside &&
                    "text-white/70"
                )}
                {...props}
              >
                {day.date.getDate()}
                {showDot && (
                  <span
                    className={cn(
                      "absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-all duration-200",
                      modifiers.selected
                        ? "bg-white/80 shadow-lg shadow-white/50"
                        : "bg-blue-400/70"
                    )}
                  />
                )}
              </button>
            )
          },
        }}
      />

      {/* Ambient glow effect */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
    </div>
  )
}
