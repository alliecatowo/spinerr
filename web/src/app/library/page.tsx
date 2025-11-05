"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VinylSleeve } from "@/components/library/VinylSleeve";
import { GridSizeControl } from "@/components/library/GridSizeControl";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { usePlayerStore } from "@/lib/store";
import { mockTracks } from "@/lib/mock-data";

export default function LibraryPage() {
  const router = useRouter();
  const [gridSize, setGridSize] = useState(4);
  const setPlaylist = usePlayerStore((state) => state.setPlaylist);
  const setTrack = usePlayerStore((state) => state.setTrack);
  const play = usePlayerStore((state) => state.play);

  useEffect(() => {
    // Ensure playlist is initialized
    if (mockTracks.length > 0) {
      setPlaylist(mockTracks);
    }
  }, [setPlaylist]);

  const handleTrackClick = (track: typeof mockTracks[0]) => {
    setTrack(track);
    play();
    router.push("/");
  };

  const getGridClasses = () => {
    switch (gridSize) {
      case 2:
        return "grid-cols-2";
      case 3:
        return "md:grid-cols-3";
      case 4:
        return "md:grid-cols-3 lg:grid-cols-4";
      case 5:
        return "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      case 6:
        return "md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
      default:
        return "md:grid-cols-3 lg:grid-cols-4";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 py-12 px-8">
      {/* Theme Toggle - top left */}
      <div className="fixed top-6 left-6 z-50">
        <ThemeToggle />
      </div>

      {/* Back Button - top right */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="container mx-auto max-w-7xl">
        {/* Header with Grid Size Control */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex items-start justify-between flex-wrap gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Your Library
            </h1>
            <p className="text-lg text-gray-600 dark:text-neutral-400">
              {mockTracks.length} {mockTracks.length === 1 ? "track" : "tracks"} in
              your collection
            </p>
          </div>
          <GridSizeControl size={gridSize} onChange={setGridSize} />
        </motion.div>

        {/* Vinyl Grid - with extra right padding for disc pullout */}
        <div className={`grid ${getGridClasses()} gap-x-16 gap-y-8`}>
          {mockTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <VinylSleeve track={track} onClick={() => handleTrackClick(track)} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
