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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-2 max-w-md mx-auto"
      >
        {/* Track Title */}
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          {track.title}
        </motion.h2>

        {/* Artist */}
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl text-foreground/80 font-medium"
        >
          {track.artist}
        </motion.p>

        {/* Album */}
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm text-muted-foreground italic"
        >
          {track.album}
        </motion.p>

        {/* Decorative Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto"
        />

        {/* Animated Music Bars (visual indicator) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-1 justify-center items-end h-12 pt-4"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-full"
              animate={{
                height: ["20%", "100%", "20%"],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
