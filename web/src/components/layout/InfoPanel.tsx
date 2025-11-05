"use client";

import { motion } from "framer-motion";
import { AtAGlance } from "./AtAGlance";
import { PlayerControls } from "@/components/music/PlayerControls";
import { usePlayerStore } from "@/lib/store";

interface InfoPanelProps {
  onSeek: (progress: number) => void;
}

/**
 * InfoPanel - Combines PlayerControls with AtAGlance info display
 * Layout: Controls on top, AtAGlance below, positioned beside vinyl player
 * Stacks below vinyl on mobile breakpoints
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

  return (
    <div className="w-full lg:min-w-[400px] lg:max-w-[440px] space-y-4">
      {/* Player Controls - Top section */}
      {currentTrack && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-gray-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5"
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
      )}

      {/* AtAGlance - Time, Events, Now Playing Info below controls */}
      <AtAGlance />
    </div>
  );
}
