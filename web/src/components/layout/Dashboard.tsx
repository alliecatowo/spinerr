'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCalendarStore, ViewMode } from '@/lib/store';
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
  const viewMode = useCalendarStore((state) => state.viewMode);
  const setViewMode = useCalendarStore((state) => state.setViewMode);

  console.log('Dashboard: Current viewMode:', viewMode);

  const handleViewModeChange = (mode: ViewMode) => {
    console.log('Dashboard: Setting viewMode to:', mode);
    setViewMode(mode);
  };

  const showMusic = viewMode === 'music' || viewMode === 'both';
  const showCalendar = viewMode === 'calendar' || viewMode === 'both';

  return (
    <div
      className={cn(
        'min-h-screen',
        'bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950',
        'dark:from-slate-950 dark:via-purple-950/10 dark:to-slate-950',
        'relative overflow-hidden',
        className
      )}
    >
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      {/* View Toggle */}
      <div className="relative z-10">
        <ViewToggle currentView={viewMode} onChangeView={handleViewModeChange} />
      </div>

      {/* Main Dashboard Grid */}
      <div className="container mx-auto px-4 py-6 md:py-8 lg:py-10 relative z-0">
        <motion.div
          layout
          className={cn(
            'grid gap-6 lg:gap-8',
            // Mobile/Tablet: Always single column
            'grid-cols-1',
            // Desktop: 60/40 split when both are visible
            viewMode === 'both' && 'lg:grid-cols-[1.5fr_1fr]',
            // Desktop: Single column for single view
            (viewMode === 'music' || viewMode === 'calendar') && 'lg:grid-cols-1'
          )}
        >
          {/* Music Player Section */}
          <AnimatePresence mode="sync">
            {showMusic && (
              <motion.div
                key="music"
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  layout: { duration: 0.3, ease: 'easeInOut' },
                  opacity: { duration: 0.25 },
                  y: { duration: 0.3, ease: 'easeOut' },
                  scale: { duration: 0.3, ease: 'easeOut' },
                }}
                className={cn(
                  'relative',
                  'rounded-3xl border border-slate-800/60',
                  'bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-800/90',
                  'backdrop-blur-xl shadow-2xl',
                  'p-6 md:p-8 lg:p-10',
                  'dark:border-slate-700/50',
                  'dark:from-slate-900/95 dark:via-slate-900/75 dark:to-slate-800/95',
                  'hover:border-slate-700/70 transition-colors duration-300',
                  'before:absolute before:inset-0 before:rounded-3xl',
                  'before:bg-gradient-to-br before:from-purple-500/5 before:to-transparent',
                  'before:pointer-events-none'
                )}
              >
                {musicSection || (
                  <div className="flex items-center justify-center h-full min-h-[500px] lg:min-h-[600px] text-slate-400">
                    Music Player
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Calendar Section */}
          <AnimatePresence mode="sync">
            {showCalendar && (
              <motion.div
                key="calendar"
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  layout: { duration: 0.3, ease: 'easeInOut' },
                  opacity: { duration: 0.25 },
                  y: { duration: 0.3, ease: 'easeOut' },
                  scale: { duration: 0.3, ease: 'easeOut' },
                }}
                className="space-y-6 lg:space-y-8"
              >
                {/* Calendar Card */}
                <motion.div
                  layout
                  className={cn(
                    'relative',
                    'rounded-3xl border border-slate-800/60',
                    'bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-800/90',
                    'backdrop-blur-xl shadow-2xl',
                    'p-6 lg:p-8',
                    'dark:border-slate-700/50',
                    'dark:from-slate-900/95 dark:via-slate-900/75 dark:to-slate-800/95',
                    'hover:border-slate-700/70 transition-colors duration-300',
                    'before:absolute before:inset-0 before:rounded-3xl',
                    'before:bg-gradient-to-br before:from-blue-500/5 before:to-transparent',
                    'before:pointer-events-none'
                  )}
                >
                  {calendarSection ? (
                    <div className="relative z-10">{calendarSection}</div>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[350px] lg:min-h-[400px] text-slate-400 relative z-10">
                      Calendar
                    </div>
                  )}
                </motion.div>

                {/* Upcoming Events Card */}
                <motion.div
                  layout
                  className={cn(
                    'relative',
                    'rounded-3xl border border-slate-800/60',
                    'bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-800/90',
                    'backdrop-blur-xl shadow-2xl',
                    'p-6 lg:p-8',
                    'dark:border-slate-700/50',
                    'dark:from-slate-900/95 dark:via-slate-900/75 dark:to-slate-800/95',
                    'hover:border-slate-700/70 transition-colors duration-300',
                    'before:absolute before:inset-0 before:rounded-3xl',
                    'before:bg-gradient-to-br before:from-emerald-500/5 before:to-transparent',
                    'before:pointer-events-none'
                  )}
                >
                  <h2 className="text-lg lg:text-xl font-semibold text-slate-100 mb-4 lg:mb-6 relative z-10">
                    Upcoming Events
                  </h2>
                  <div className="flex items-center justify-center h-full min-h-[150px] lg:min-h-[180px] text-slate-400 relative z-10">
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
