'use client';

import { motion } from 'framer-motion';
import { Music2, Calendar, LayoutGrid } from 'lucide-react';
import { ViewMode } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  className?: string;
}

const viewOptions = [
  {
    value: 'music' as ViewMode,
    label: 'Music',
    icon: Music2,
    shortLabel: 'Music',
  },
  {
    value: 'both' as ViewMode,
    label: 'Both',
    icon: LayoutGrid,
    shortLabel: 'Both',
  },
  {
    value: 'calendar' as ViewMode,
    label: 'Calendar',
    icon: Calendar,
    shortLabel: 'Calendar',
  },
];

export function ViewToggle({
  currentView,
  onChangeView,
  className,
}: ViewToggleProps) {
  const handleViewChange = (view: ViewMode) => {
    onChangeView(view);
  };

  return (
    <>
      {/* Desktop: Top right corner */}
      <div
        className={cn(
          'hidden md:block',
          'fixed top-6 right-6 z-50',
          className
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'inline-flex items-center gap-2 p-1.5',
            'rounded-xl border border-slate-800/50',
            'bg-slate-900/80 backdrop-blur-xl',
            'shadow-2xl shadow-slate-950/50',
            'dark:border-slate-700/50',
            'dark:bg-slate-900/90'
          )}
        >
          {viewOptions.map((option) => {
            const Icon = option.icon;
            const isActive = currentView === option.value;

            return (
              <motion.div key={option.value} className="relative">
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="default"
                  onClick={() => handleViewChange(option.value)}
                  className={cn(
                    'relative px-4 py-2 h-9',
                    'transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
                    'dark:hover:bg-slate-800/70'
                  )}
                >
                  <Icon className="size-4 mr-2" />
                  <span className="font-medium">{option.label}</span>
                </Button>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={cn(
                      'absolute inset-0 rounded-md',
                      'bg-gradient-to-br from-blue-600 to-purple-600',
                      'opacity-20 blur-sm'
                    )}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Mobile: Bottom fixed bar */}
      <div
        className={cn(
          'md:hidden',
          'fixed bottom-0 left-0 right-0 z-50',
          'pb-safe',
          className
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'flex items-center justify-around gap-2',
            'mx-4 mb-4 p-2',
            'rounded-2xl border border-slate-800/50',
            'bg-slate-900/95 backdrop-blur-xl',
            'shadow-2xl shadow-slate-950/50',
            'dark:border-slate-700/50',
            'dark:bg-slate-900/95'
          )}
        >
          {viewOptions.map((option) => {
            const Icon = option.icon;
            const isActive = currentView === option.value;

            return (
              <motion.div
                key={option.value}
                className="relative flex-1"
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="default"
                  onClick={() => handleViewChange(option.value)}
                  className={cn(
                    'relative w-full flex-col h-auto py-3 px-2',
                    'transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
                    'dark:hover:bg-slate-800/70'
                  )}
                >
                  <Icon className="size-5 mb-1" />
                  <span className="text-xs font-medium">
                    {option.shortLabel}
                  </span>
                </Button>

                {/* Active indicator for mobile */}
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className={cn(
                      'absolute inset-0 rounded-md',
                      'bg-gradient-to-br from-blue-600 to-purple-600',
                      'opacity-20 blur-sm'
                    )}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </>
  );
}
