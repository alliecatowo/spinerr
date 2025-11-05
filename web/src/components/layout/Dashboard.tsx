"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCalendarStore } from "@/lib/store";
import { InfoToggle } from "./InfoToggle";
import { ThemeToggle } from "./ThemeToggle";
import { Navigation } from "./Navigation";
import { Sidebar } from "./Sidebar";
import { AccountButton } from "@/components/auth/AccountButton";
import { HelpButton } from "@/components/tours/HelpButton";

interface DashboardProps {
  musicSection: React.ReactNode;
  calendarSection: React.ReactNode;
}

export function Dashboard({ musicSection, calendarSection }: DashboardProps) {
  const showCalendar = useCalendarStore((state) => state.showCalendar);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 overflow-x-hidden">
      {/* Minimal Navigation - top left */}
      <div className="fixed top-6 left-6 z-50" data-tour="navigation">
        <Navigation />
      </div>

      {/* Theme Toggle - top left, below nav with consistent spacing */}
      <div className="fixed top-[60px] left-6 z-50" data-tour="theme-toggle">
        <ThemeToggle />
      </div>

      {/* Account & Info - top right, aligned with navigation */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
        <AccountButton />
        <div data-tour="info-toggle">
          <InfoToggle />
        </div>
      </div>

      {/* Sidebar - left side, below theme toggle with consistent spacing */}
      <div data-tour="sidebar">
        <Sidebar />
      </div>

      {/* Main Content - floating, zen layout with flex, no scroll */}
      {/* On large screens: offset left margin to optically center vinyl player, accounting for fixed sidebar */}
      {/* When calendar is hidden: add right margin to truly center the vinyl */}
      <div className={`h-screen flex items-center justify-center px-12 py-8 overflow-hidden transition-all duration-500 ${
        showCalendar ? 'lg:ml-[140px]' : 'lg:ml-[140px] lg:mr-[140px]'
      }`}>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 w-full max-w-[1600px]">
          {/* Music Section - always visible */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex items-center justify-center w-full"
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

      {/* Help Button - Floating bottom right */}
      <HelpButton />
    </div>
  );
}
