"use client"

import * as React from "react"
import { addDays, addHours } from "date-fns"
import { Calendar, UpcomingEvents, type CalendarEvent } from "./index"

/**
 * Example usage of the Calendar components
 *
 * This component demonstrates how to use the Calendar, UpcomingEvents,
 * and EventCard components together in a typical layout.
 */
export function CalendarExample() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  )

  // Example events data
  const exampleEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Team Standup",
      date: new Date(),
      type: "meeting",
      time: "9:00 AM",
      description: "Daily sync with the development team",
    },
    {
      id: "2",
      title: "Doctor's Appointment",
      date: addDays(new Date(), 1),
      type: "appointment",
      time: "2:30 PM",
      description: "Annual checkup at City Medical Center",
    },
    {
      id: "3",
      title: "Sarah's Birthday",
      date: addDays(new Date(), 2),
      type: "birthday",
      time: "All Day",
      description: "Don't forget to send a card!",
    },
    {
      id: "4",
      title: "Project Deadline",
      date: addDays(new Date(), 3),
      type: "reminder",
      time: "5:00 PM",
      description: "Submit final deliverables to client",
    },
    {
      id: "5",
      title: "Client Presentation",
      date: addDays(new Date(), 4),
      type: "meeting",
      time: "10:00 AM",
      description: "Q4 progress review with stakeholders",
    },
    {
      id: "6",
      title: "Dentist Appointment",
      date: addDays(new Date(), 5),
      type: "appointment",
      time: "3:00 PM",
    },
    {
      id: "7",
      title: "Submit Tax Documents",
      date: addDays(new Date(), 7),
      type: "reminder",
      time: "End of Day",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Calendar</h1>
          <p className="mt-2 text-white/60">
            Manage your schedule and upcoming events
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Main Calendar */}
          <Calendar
            selectedDate={selectedDate}
            events={exampleEvents}
            onSelectDate={setSelectedDate}
          />

          {/* Upcoming Events Sidebar */}
          <UpcomingEvents
            events={exampleEvents}
            selectedDate={selectedDate}
            maxEvents={7}
          />
        </div>
      </div>
    </div>
  )
}
