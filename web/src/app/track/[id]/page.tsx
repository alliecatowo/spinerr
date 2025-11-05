"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { usePlayerStore } from "@/lib/store";
import { mockTracks } from "@/lib/mock-data";

export default function TrackPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [discPulled, setDiscPulled] = useState(false);
  const [track, setTrackData] = useState<typeof mockTracks[0] | null>(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setTrack = usePlayerStore((state) => state.setTrack);
  const play = usePlayerStore((state) => state.play);
  const pause = usePlayerStore((state) => state.pause);

  useEffect(() => {
    const foundTrack = mockTracks.find((t) => t.id === params.id);
    if (foundTrack) {
      setTrackData(foundTrack);
    }
  }, [params.id]);

  if (!track) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-gray-900 dark:text-white text-sm">Loading...</div>
      </div>
    );
  }

  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const handlePlayPause = () => {
    if (!isCurrentTrack) {
      setTrack(track);
      play();
    } else {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 py-12 px-8">
      {/* Theme Toggle - top left */}
      <div className="fixed top-6 left-6 z-50">
        <ThemeToggle />
      </div>
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {track.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-neutral-400">
            {track.artist} • {track.album}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Vinyl Sleeve with Pull-out Disc */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div
              className="relative w-full aspect-square cursor-pointer"
              onMouseEnter={() => setDiscPulled(true)}
              onMouseLeave={() => setDiscPulled(false)}
              onClick={handlePlayPause}
            >
              {/* Sleeve */}
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${track.coverColor} 0%, ${track.coverColor}dd 100%)`,
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white">
                  <h3 className="text-3xl font-bold text-center mb-3">
                    {track.title}
                  </h3>
                  <p className="text-xl opacity-90">{track.artist}</p>
                  <p className="text-base opacity-70 mt-3">{track.album}</p>
                </div>
              </div>

              {/* Vinyl Disc */}
              <motion.div
                className="absolute top-0 -right-8 w-full h-full pointer-events-none"
                initial={{ x: -40 }}
                animate={{ x: discPulled ? 60 : -40 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative w-full h-full">
                  <div
                    className="absolute inset-4 rounded-full shadow-2xl"
                    style={{
                      background: `radial-gradient(circle at center, ${track.coverColor}40 0%, ${track.coverColor}30 20%, ${track.coverColor}20 40%, ${track.coverColor}15 60%, #000 100%)`,
                    }}
                  >
                    {/* Grooves */}
                    {[...Array(30)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute inset-0 rounded-full border border-white/5"
                        style={{
                          transform: `scale(${1 - i * 0.03})`,
                        }}
                      />
                    ))}

                    {/* Center Label - hardcoded circle */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-white font-bold shadow-2xl ring-2 ring-black/30"
                      style={{
                        backgroundColor: track.coverColor,
                        width: '120px',
                        height: '120px'
                      }}
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8 ml-1" fill="currentColor" />
                      )}
                    </div>

                    {/* Center Hole */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 rounded-full shadow-inner" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Track Info and Actions */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* Play Button */}
            <div>
              <Button
                size="lg"
                onClick={handlePlayPause}
                className="w-full text-base h-12"
              >
                {isCurrentlyPlaying ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" fill="currentColor" />
                    Play
                  </>
                )}
              </Button>
            </div>

            {/* Track Details */}
            <div className="space-y-4 p-6 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-neutral-500 mb-1">
                  Duration
                </h3>
                <p className="text-base text-gray-900 dark:text-white">
                  {Math.floor(track.duration / 60)}:
                  {(track.duration % 60).toString().padStart(2, "0")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-neutral-500 mb-1">
                  Genre
                </h3>
                <p className="text-base text-gray-900 dark:text-white">
                  {track.genre || "Unknown"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-neutral-500 mb-1">
                  Album
                </h3>
                <p className="text-base text-gray-900 dark:text-white">
                  {track.album}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="default"
                className="w-full justify-start"
                onClick={() => alert("Edit functionality coming soon!")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Track Info
              </Button>
              <Button
                variant="outline"
                size="default"
                className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                onClick={() => {
                  if (
                    confirm(
                      `Are you sure you want to delete "${track.title}"?`
                    )
                  ) {
                    alert("Delete functionality coming soon!");
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Track
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
