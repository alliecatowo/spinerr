"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useViewModeStore } from "@/lib/store";
import { InfoToggle } from "./InfoToggle";
import { ThemeToggle } from "./ThemeToggle";
import { Navigation } from "./Navigation";
import { Sidebar } from "./Sidebar";
import { AccountButton } from "@/components/auth/AccountButton";
import { AtAGlance } from "./AtAGlance";
import { HelpButton } from "@/components/tours/HelpButton";
import { Maximize2, Minimize2 } from "lucide-react";

interface DashboardProps {
  musicSection: React.ReactNode;
  calendarSection: React.ReactNode;
}

export function Dashboard({ musicSection, calendarSection }: DashboardProps) {
  const { viewMode, showSidebar, showControls, showInfo, enterAmbientMode, exitAmbientMode, toggleSidebar, toggleInfo } = useViewModeStore();
  const isAmbient = viewMode === 'ambient';
  const isMinimal = viewMode === 'minimal';

  return (
    <div className="relative min-h-screen bg-white dark:bg-neutral-950 overflow-hidden">
      {/* Floating At a Glance - Always visible */}
      <AnimatePresence>
        {showInfo && <AtAGlance />}
      </AnimatePresence>

      {/* Main Container */}
      <div className="h-screen flex flex-col">
        {/* Top Navigation Bar - Collapsible */}
        <AnimatePresence>
          {!isMinimal && (
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-shrink-0 w-full z-40"
            >
              <div className="flex items-start justify-between p-6">
                {/* Left side controls */}
                <div className="flex flex-col gap-3">
                  <div data-tour="navigation">
                    <Navigation />
                  </div>
                  <div data-tour="theme-toggle">
                    <ThemeToggle />
                  </div>
                  {/* Sidebar toggle for mobile/ambient */}
                  <button
                    onClick={toggleSidebar}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors"
                    aria-label="Toggle sidebar"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                {/* Right side controls */}
                <div className="flex flex-col gap-3">
                  <AccountButton />

                  {/* Ambient Mode Toggle */}
                  <button
                    onClick={isAmbient ? exitAmbientMode : enterAmbientMode}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isAmbient
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20'
                        : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-900'
                    }`}
                    aria-label={isAmbient ? "Exit ambient mode" : "Enter ambient mode"}
                    title={isAmbient ? "Exit ambient mode" : "Enter ambient mode"}
                  >
                    {isAmbient ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>

                  <div data-tour="info-toggle">
                    <InfoToggle />
                  </div>
                </div>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Collapsible */}
          <AnimatePresence>
            {showSidebar && !isAmbient && (
              <motion.aside
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 hidden lg:block"
                data-tour="sidebar"
              >
                <Sidebar />
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Center Content - Music + Calendar */}
          <main className="flex-1 flex items-center justify-center px-6 lg:px-12 py-8 overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 w-full max-w-[1600px]">
              {/* Music Section - always visible */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex items-center justify-center w-full"
              >
                {musicSection}
              </motion.div>

              {/* Calendar/Controls Section - Collapsible */}
              <AnimatePresence mode="sync">
                {showControls && !isMinimal && (
                  <motion.div
                    key="controls"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
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

      {/* Help Button - Hidden in ambient/minimal mode, or moved to settings */}
      <AnimatePresence>
        {!isAmbient && !isMinimal && <HelpButton />}
      </AnimatePresence>
    </div>
  );
}
