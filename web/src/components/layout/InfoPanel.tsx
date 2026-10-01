"use client";

import { PlayerControls } from "@/components/music/PlayerControls";
import { usePlayerStore } from "@/lib/store";

interface InfoPanelProps {
  onSeek: (progress: number) => void;
}

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
    <div data-tour="player-controls">
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
    </div>
  );
}
