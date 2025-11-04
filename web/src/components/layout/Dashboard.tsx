"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCalendarStore } from "@/lib/store";
import { ViewToggle } from "./ViewToggle";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* View Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ViewToggle
          currentView={viewMode}
          onChangeView={setViewMode}
        />
      </div>

      {/* Main Content - simple grid */}
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className={`grid gap-12 ${viewMode === "both" ? "lg:grid-cols-[1fr_400px]" : "grid-cols-1 place-items-center"}`}>
          {/* Music Section */}
          <AnimatePresence mode="sync">
            {showMusic && (
              <motion.div
                key="music"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
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
