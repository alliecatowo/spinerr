'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import { useTour } from '@/contexts/TourContext';
import { getAllTours } from '@/lib/tours/tour-config';
import { useTourStore } from '@/lib/store';

export function HelpButton() {
  const [showMenu, setShowMenu] = useState(false);
  const { startTour } = useTour();
  const resetAllTours = useTourStore((state) => state.resetAllTours);

  // Memoize tours list - it never changes
  const tours = useMemo(() => getAllTours(), []);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleTourStart = useCallback((tourId: string) => {
    setShowMenu(false);
    startTour(tourId);
  }, [startTour]);

  const handleResetTours = useCallback(() => {
    resetAllTours();
    setShowMenu(false);
    // Optionally restart onboarding
    setTimeout(() => startTour('onboarding'), 500);
  }, [resetAllTours, startTour]);

  const toggleMenu = useCallback(() => setShowMenu(prev => !prev), []);

  return (
    <>
      {/* Help Button - Bottom Right */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center transition-colors"
        aria-label="Help & Tours"
      >
        {showMenu ? (
          <X className="w-6 h-6" />
        ) : (
          <HelpCircle className="w-6 h-6" />
        )}
      </motion.button>

      {/* Tour Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 right-6 z-50 w-72 rounded-xl border border-gray-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 shadow-xl p-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Tours & Help
              </h3>

              <div className="space-y-2">
                {tours.map((tour) => (
                  <button
                    key={tour.id}
                    onClick={() => handleTourStart(tour.id)}
                    className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {tour.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-neutral-400 mt-0.5">
                      {tour.description}
                    </div>
                  </button>
                ))}

                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-neutral-800">
                  <button
                    onClick={handleResetTours}
                    className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      Reset All Tours
                    </div>
                    <div className="text-xs text-gray-600 dark:text-neutral-400 mt-0.5">
                      Start over from the beginning
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
