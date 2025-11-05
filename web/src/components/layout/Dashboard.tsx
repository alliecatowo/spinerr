"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCalendarStore } from "@/lib/store";
import { ViewToggle } from "./ViewToggle";
import { ThemeToggle } from "./ThemeToggle";

interface DashboardProps {
  musicSection: React.ReactNode;
  calendarSection: React.ReactNode;
}

export function Dashboard({ musicSection, calendarSection }: DashboardProps) {
  const viewMode = useCalendarStore((state) => state.viewMode);
  const setViewMode = useCalendarStore((state) => state.setViewMode);

  const showMusic = viewMode === "music" || viewMode === "both";
  const showCalendar = viewMode === "calendar" || viewMode === "both";

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Theme Toggle - top left */}
      <div className="fixed top-6 left-6 z-50">
        <ThemeToggle />
      </div>

      {/* View Toggle - top right */}
      <div className="fixed top-6 right-6 z-50">
        <ViewToggle
          currentView={viewMode}
          onChangeView={setViewMode}
        />
      </div>

      {/* Main Content - wider layout */}
      <div className="container mx-auto px-8 py-8 max-w-7xl">
        <div className={`grid gap-12 ${viewMode === "both" ? "lg:grid-cols-[1.5fr_1fr] items-start" : "grid-cols-1 place-items-center"}`}>
          {/* Music Section */}
          <AnimatePresence mode="sync">
            {showMusic && (
              <motion.div
                key="music"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {musicSection}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Calendar Section */}
          <AnimatePresence mode="sync">
            {showCalendar && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md"
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
