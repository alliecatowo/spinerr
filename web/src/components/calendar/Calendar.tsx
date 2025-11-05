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
        "relative rounded-xl border border-gray-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 p-5 shadow-lg shadow-gray-200/50 dark:shadow-black/20",
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
                  "relative inline-flex h-8 w-8 items-center justify-center rounded text-sm transition-colors duration-150",
                  "hover:bg-gray-100 dark:hover:bg-neutral-800",
                  modifiers.selected &&
                    "bg-gray-900 dark:bg-white text-white dark:text-black font-medium",
                  modifiers.today &&
                    !modifiers.selected &&
                    "font-medium text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-neutral-700",
                  modifiers.outside && "text-gray-300 dark:text-neutral-700",
                  modifiers.disabled && "opacity-30 cursor-not-allowed",
                  !modifiers.selected &&
                    !modifiers.today &&
                    !modifiers.outside &&
                    "text-gray-600 dark:text-neutral-400"
                )}
                {...props}
              >
                {day.date.getDate()}
                {showDot && (
                  <span
                    className={cn(
                      "absolute bottom-0.5 left-1/2 h-0.5 w-0.5 -translate-x-1/2 rounded-full",
                      modifiers.selected
                        ? "bg-white dark:bg-black"
                        : "bg-blue-500 dark:bg-blue-400"
                    )}
                  />
                )}
              </button>
            )
          },
        }}
      />
    </div>
  )
}
