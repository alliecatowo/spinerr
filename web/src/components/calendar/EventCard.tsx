"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  Calendar,
  Clock,
  Users,
  Gift,
  Bell,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "./Calendar"

interface EventCardProps {
  event: CalendarEvent
  className?: string
}

const eventTypeConfig: Record<
  CalendarEvent["type"],
  {
    color: string
    icon: LucideIcon
  }
> = {
  meeting: {
    color: "text-blue-500 dark:text-blue-400",
    icon: Users,
  },
  appointment: {
    color: "text-green-500 dark:text-green-400",
    icon: Calendar,
  },
  birthday: {
    color: "text-pink-500 dark:text-pink-400",
    icon: Gift,
  },
  reminder: {
    color: "text-orange-500 dark:text-orange-400",
    icon: Bell,
  },
}

export function EventCard({ event, className }: EventCardProps) {
  const config = eventTypeConfig[event.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group relative px-2 py-2 rounded transition-colors duration-150",
        "hover:bg-gray-50 dark:hover:bg-neutral-800",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        {/* Icon - minimal */}
        <Icon className={cn("h-3.5 w-3.5 shrink-0", config.color)} />

        {/* Content - compact */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="text-xs font-medium text-gray-900 dark:text-white truncate">
              {event.title}
            </h3>
            <span className="text-xs text-gray-400 dark:text-neutral-600 shrink-0">
              {event.time || format(event.date, "h:mm a")}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
