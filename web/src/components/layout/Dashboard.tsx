'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCalendarStore } from '@/lib/store';
import { ViewToggle } from './ViewToggle';
import { cn } from '@/lib/utils';

interface DashboardProps {
  musicSection?: React.ReactNode;
  calendarSection?: React.ReactNode;
  className?: string;
}

export function Dashboard({
  musicSection,
  calendarSection,
  className,
}: DashboardProps) {
  const { viewMode, setViewMode } = useCalendarStore();

  const showMusic = viewMode === 'music' || viewMode === 'both';
  const showCalendar = viewMode === 'calendar' || viewMode === 'both';

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
        'dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
        className
      )}
    >
      {/* View Toggle */}
      <ViewToggle currentView={viewMode} onChangeView={setViewMode} />

      {/* Main Dashboard Grid */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <motion.div
          layout
          className={cn(
            'grid gap-6',
            // Desktop: 60/40 split when both are visible
            viewMode === 'both' && 'lg:grid-cols-[1.5fr,1fr]',
            // Single column for single view
            (viewMode === 'music' || viewMode === 'calendar') && 'grid-cols-1',
            // Tablet and mobile: stacked
            'grid-cols-1'
          )}
        >
          {/* Music Player Section */}
          <AnimatePresence mode="wait">
            {showMusic && (
              <motion.div
                key="music"
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  layout: { duration: 0.3, ease: 'easeInOut' },
                  opacity: { duration: 0.2 },
                  x: { duration: 0.3 },
                }}
                className={cn(
                  'rounded-2xl border border-slate-800/50',
                  'bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/80',
                  'backdrop-blur-xl shadow-2xl',
                  'p-6 md:p-8',
                  'dark:border-slate-700/50',
                  'dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-800/90'
                )}
              >
                {musicSection || (
                  <div className="flex items-center justify-center h-full min-h-[400px] text-slate-400">
                    Music Player
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Calendar Section */}
          <AnimatePresence mode="wait">
            {showCalendar && (
              <motion.div
                key="calendar"
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                  layout: { duration: 0.3, ease: 'easeInOut' },
                  opacity: { duration: 0.2 },
                  x: { duration: 0.3 },
                }}
                className="space-y-6"
              >
                {/* Calendar Card */}
                <motion.div
                  layout
                  className={cn(
                    'rounded-2xl border border-slate-800/50',
                    'bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/80',
                    'backdrop-blur-xl shadow-2xl',
                    'p-6',
                    'dark:border-slate-700/50',
                    'dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-800/90'
                  )}
                >
                  {calendarSection ? (
                    <div>{calendarSection}</div>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[300px] text-slate-400">
                      Calendar
                    </div>
                  )}
                </motion.div>

                {/* Upcoming Events Card */}
                <motion.div
                  layout
                  className={cn(
                    'rounded-2xl border border-slate-800/50',
                    'bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/80',
                    'backdrop-blur-xl shadow-2xl',
                    'p-6',
                    'dark:border-slate-700/50',
                    'dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-800/90'
                  )}
                >
                  <h2 className="text-lg font-semibold text-slate-100 mb-4">
                    Upcoming Events
                  </h2>
                  <div className="flex items-center justify-center h-full min-h-[150px] text-slate-400">
                    No upcoming events
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
