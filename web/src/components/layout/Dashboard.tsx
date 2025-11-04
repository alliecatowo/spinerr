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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* View Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ViewToggle
          currentView={viewMode}
          onChangeView={setViewMode}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className={`grid gap-8 ${viewMode === "both" ? "lg:grid-cols-[1.5fr_1fr]" : "grid-cols-1"}`}>
          {/* Music Section */}
          <AnimatePresence mode="sync">
            {showMusic && (
              <motion.div
                key="music"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center"
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
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
