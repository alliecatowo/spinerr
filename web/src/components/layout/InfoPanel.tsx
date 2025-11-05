"use client";

import { motion } from "framer-motion";
import { PlayerControls } from "@/components/music/PlayerControls";
import { usePlayerStore } from "@/lib/store";

interface InfoPanelProps {
  onSeek: (progress: number) => void;
}

/**
 * InfoPanel - Minimal player controls
 * At a Glance is now floating independently in top-right
 */
export function InfoPanel({ onSeek }: InfoPanelProps) {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const progress = usePlayerStore((state) => state.progress);
  const volume = usePlayerStore((state) => state.volume);
  const play = usePlayerStore((state) => state.play);
  const pause = usePlayerStore((state) => state.pause);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const prevTrack = usePlayerStore((state) => state.prevTrack);
  const setVolume = usePlayerStore((state) => state.setVolume);

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-full lg:min-w-[400px] lg:max-w-[440px] rounded-2xl border border-gray-200/40 dark:border-neutral-800/40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-2xl shadow-gray-200/50 dark:shadow-black/30 p-6"
      data-tour="player-controls"
    >
      <PlayerControls
        isPlaying={isPlaying}
        progress={progress}
        volume={volume}
        duration={currentTrack.duration}
        onPlay={play}
        onPause={pause}
        onNext={nextTrack}
        onPrev={prevTrack}
        onSeek={onSeek}
        onVolumeChange={setVolume}
      />
    </motion.div>
  );
}
