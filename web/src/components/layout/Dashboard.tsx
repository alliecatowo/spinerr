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
    <div className="relative min-h-screen bg-white dark:bg-neutral-950 overflow-hidden">
      {/* Main Container - Responsive Grid Layout */}
      <div className="h-screen flex flex-col">
        {/* Top Navigation Bar */}
        <header className="flex-shrink-0 w-full z-50">
          <div className="flex items-start justify-between p-6">
            {/* Left side controls */}
            <div className="flex flex-col gap-3">
              <div data-tour="navigation">
                <Navigation />
              </div>
              <div data-tour="theme-toggle">
                <ThemeToggle />
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex flex-col gap-3">
              <AccountButton />
              <div data-tour="info-toggle">
                <InfoToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - Flex container for sidebar + content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - left side */}
          <aside className="flex-shrink-0 hidden lg:block" data-tour="sidebar">
            <Sidebar />
          </aside>

          {/* Center Content - Music + Calendar */}
          <main className="flex-1 flex items-center justify-center px-6 lg:px-12 py-8 overflow-hidden">
            <div className={`flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 w-full transition-all duration-500 ${
              showCalendar ? 'max-w-[1600px]' : 'max-w-[1200px]'
            }`}>
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
          </main>
        </div>
      </div>

      {/* Help Button - Floating bottom right */}
      <HelpButton />
    </div>
  );
}
