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
            'inline-flex items-center gap-1 p-1',
            'rounded-lg border border-gray-200 dark:border-neutral-800',
            'bg-white dark:bg-neutral-900 shadow-sm'
          )}
        >
          {viewOptions.map((option) => {
            const Icon = option.icon;
            const isActive = currentView === option.value;

            return (
              <motion.div key={option.value} className="relative">
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewChange(option.value)}
                  className={cn(
                    'relative px-3 py-1.5 h-8 text-xs',
                    'transition-colors duration-150',
                    isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                      : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  )}
                >
                  <Icon className="size-3.5 mr-1.5" />
                  <span className="font-medium">{option.label}</span>
                </Button>
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
            'flex items-center justify-around gap-1',
            'mx-4 mb-4 p-1',
            'rounded-lg border border-gray-200 dark:border-neutral-800',
            'bg-white dark:bg-neutral-900 shadow-sm'
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
                    'relative w-full flex-col h-auto py-2 px-2',
                    'transition-colors duration-150',
                    isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                      : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  )}
                >
                  <Icon className="size-4 mb-1" />
                  <span className="text-xs font-medium">
                    {option.shortLabel}
                  </span>
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </>
  );
}
