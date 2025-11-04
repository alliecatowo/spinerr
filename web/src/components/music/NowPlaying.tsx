"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Track } from "@/lib/store";

interface NowPlayingProps {
  track: Track;
  isPlaying?: boolean;
}

export function NowPlaying({ track, isPlaying = false }: NowPlayingProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={track.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-3"
      >
        {/* Track Title */}
        <h2 className="text-2xl font-semibold text-white">
          {track.title}
        </h2>

        {/* Artist */}
        <p className="text-base text-white/70">
          {track.artist}
        </p>

        {/* Music Bars - Optimized with will-change */}
        {isPlaying && (
          <div className="flex gap-1 justify-center items-end h-8 pt-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-white/40 rounded-full will-change-transform"
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
            ))}
          </div>
        )}

        {/* Album - subtle */}
        <p className="text-xs text-white/40">
          {track.album}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
