"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Track } from "@/lib/store";

interface NowPlayingProps {
  track: Track;
}

export function NowPlaying({ track }: NowPlayingProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={track.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-1"
      >
        {/* Track Title */}
        <h2 className="text-2xl font-semibold text-white">
          {track.title}
        </h2>

        {/* Artist */}
        <p className="text-base text-white/70">
          {track.artist}
        </p>

        {/* Album */}
        <p className="text-sm text-white/50">
          {track.album}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
