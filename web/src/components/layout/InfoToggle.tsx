'use client';

import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useCalendarStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function InfoToggle() {
  const showCalendar = useCalendarStore((state) => state.showCalendar);
  const toggleCalendar = useCalendarStore((state) => state.toggleCalendar);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant={showCalendar ? 'default' : 'outline'}
        size="sm"
        onClick={toggleCalendar}
        className={cn(
          'h-9 px-4 transition-colors duration-150',
          showCalendar
            ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
            : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
        )}
      >
        <Info className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Info</span>
      </Button>
    </motion.div>
  );
}
