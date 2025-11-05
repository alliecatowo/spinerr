"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Track } from "@/lib/store";

interface NowPlayingProps {
  track: Track;
  isPlaying?: boolean;
}

export const NowPlaying = memo(function NowPlaying({ track, isPlaying = false }: NowPlayingProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={track.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {/* Track Title */}
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {track.title}
        </h2>

        {/* Artist */}
        <p className="text-base text-gray-600 dark:text-neutral-400 mt-1">
          {track.artist}
        </p>

        {/* Music Bars - Fixed height container to prevent layout shift */}
        <div className="flex gap-1 justify-center items-end h-8 mt-3">
          {isPlaying ? (
            [0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-gray-400 dark:bg-neutral-600 rounded-full will-change-transform"
                style={{ transformOrigin: "bottom" }}
                animate={{
                  scaleY: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
