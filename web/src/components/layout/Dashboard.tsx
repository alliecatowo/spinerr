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
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* View Toggle - floating */}
      <div className="fixed top-6 right-6 z-50">
        <ViewToggle
          currentView={viewMode}
          onChangeView={setViewMode}
        />
      </div>

      {/* Main Content - zen lofi layout */}
      <div className="h-full flex items-start justify-center px-6 pt-12 pb-6">
        <div className={`w-full max-w-7xl h-full flex gap-12 ${viewMode === "both" ? "" : "justify-center"}`}>
          {/* Music Section - floats on left */}
          <AnimatePresence mode="sync">
            {showMusic && (
              <motion.div
                key="music"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-shrink-0 flex items-start pt-8"
              >
                {musicSection}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Calendar Section - floats on right */}
          <AnimatePresence mode="sync">
            {showCalendar && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1 max-w-md pt-8 h-full overflow-hidden"
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
