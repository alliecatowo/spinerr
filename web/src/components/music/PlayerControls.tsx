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
      className="w-full max-w-2xl space-y-6"
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
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          className="hover:scale-110 transition-transform"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="default"
            size="icon-lg"
            onClick={isPlaying ? onPause : onPlay}
            className="shadow-lg"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>
        </motion.div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="hover:scale-110 transition-transform"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onVolumeChange(isMuted ? 0.7 : 0)}
          className="shrink-0"
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
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground w-12 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </motion.div>
  );
}
