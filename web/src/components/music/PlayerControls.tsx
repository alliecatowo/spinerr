"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion } from "framer-motion";

interface PlayerControlsProps {
  isPlaying: boolean;
  progress: number;
  volume: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (progress: number) => void;
  onVolumeChange: (volume: number) => void;
}

export function PlayerControls({
  isPlaying,
  progress,
  volume,
  duration,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
}: PlayerControlsProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentTime = progress * duration;
  const isMuted = volume === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-full space-y-5"
    >
      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[progress * 100]}
          onValueChange={(value) => onSeek(value[0] / 100)}
          max={100}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs tabular-nums text-gray-500 dark:text-neutral-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons and Volume - single line, evenly justified */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          className="h-10 w-10 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={isPlaying ? onPause : onPlay}
            className="h-12 w-12 text-gray-900 dark:text-white bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
        </motion.div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="h-10 w-10 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <SkipForward className="h-5 w-5" />
        </Button>

        {/* Volume inline */}
        <div className="flex items-center gap-2 ml-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onVolumeChange(isMuted ? 0.7 : 0)}
            className="h-8 w-8 shrink-0 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[volume * 100]}
            onValueChange={(value) => onVolumeChange(value[0] / 100)}
            max={100}
            step={1}
            className="w-24"
          />
        </div>
      </div>
    </motion.div>
  );
}
