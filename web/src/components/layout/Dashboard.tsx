"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCalendarStore } from "@/lib/store";
import { CalendarToggle } from "./CalendarToggle";
import { ThemeToggle } from "./ThemeToggle";
import { Navigation } from "./Navigation";

interface DashboardProps {
  musicSection: React.ReactNode;
  calendarSection: React.ReactNode;
}

export function Dashboard({ musicSection, calendarSection }: DashboardProps) {
  const showCalendar = useCalendarStore((state) => state.showCalendar);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 overflow-x-hidden">
      {/* Minimal Navigation - top left */}
      <div className="fixed top-8 left-8 z-50">
        <Navigation />
      </div>

      {/* Theme Toggle - top left, below nav */}
      <div className="fixed top-20 left-8 z-50">
        <ThemeToggle />
      </div>

      {/* Calendar Toggle - top right */}
      <div className="fixed top-8 right-8 z-50">
        <CalendarToggle />
      </div>

      {/* Main Content - floating, zen layout with flex, no scroll */}
      <div className="h-screen flex items-center justify-center px-12 py-8 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-16 w-full max-w-[1800px]">
          {/* Music Section - always visible */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex items-center justify-center"
          >
            {musicSection}
          </motion.div>

          {/* Calendar Section - toggleable */}
          <AnimatePresence mode="sync">
            {showCalendar && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full lg:w-auto lg:min-w-[420px] lg:max-w-[480px]"
              >
                {calendarSection}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
