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
    bgColor: string
    glowColor: string
    icon: LucideIcon
  }
> = {
  meeting: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    glowColor: "shadow-blue-500/20",
    icon: Users,
  },
  appointment: {
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    glowColor: "shadow-green-500/20",
    icon: Calendar,
  },
  birthday: {
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    glowColor: "shadow-pink-500/20",
    icon: Gift,
  },
  reminder: {
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    glowColor: "shadow-orange-500/20",
    icon: Bell,
  },
}

export function EventCard({ event, className }: EventCardProps) {
  const config = eventTypeConfig[event.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-white/5 p-4 backdrop-blur-xl transition-all duration-200",
        "bg-gradient-to-br from-white/5 to-white/[0.02]",
        "hover:border-white/10 hover:shadow-lg",
        config.glowColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
            config.bgColor,
            "group-hover:scale-110"
          )}
        >
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-white/90 leading-tight">
            {event.title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-white/50">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {event.time || format(event.date, "h:mm a")}
            </span>
          </div>

          {event.description && (
            <p className="text-sm text-white/40 leading-relaxed line-clamp-2 mt-2">
              {event.description}
            </p>
          )}
        </div>
      </div>

      {/* Subtle gradient overlay on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300",
          config.bgColor
        )}
      />

      {/* Type indicator bar */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-1 transition-all duration-200",
          config.bgColor,
          "group-hover:w-1.5"
        )}
      />
    </motion.div>
  )
}
