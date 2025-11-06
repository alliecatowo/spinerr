"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Track } from "@/lib/store";
import { vinylRenderer } from "@/lib/vinyl-renderer";

interface VinylDiscProps {
  track: Track;
  isPlaying: boolean;
  progress: number;
  onPlayPause?: () => void;
}

export function VinylDisc({
  track,
  isPlaying,
  progress,
  onPlayPause,
}: VinylDiscProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // INITIALIZATION: Initialize or reuse existing renderer
  useEffect(() => {
    const initializeRenderer = async () => {
      if (!containerRef.current) {
        console.error("[VinylDisc] No container ref available");
        return;
      }

      console.log("[VinylDisc] Initializing vinyl renderer");

      try {
        await vinylRenderer.initialize(
          containerRef.current,
          track.id,
          track.coverColor,
          track.artworkUrl, // Pass artwork URL to p5
          isPlaying,
          progress
        );
        setIsLoading(false);
      } catch (error) {
        console.error("[VinylDisc] Error initializing renderer:", error);
        setIsLoading(false);
      }
    };

    initializeRenderer();

    // Don't cleanup on unmount - keep renderer alive for performance
    // Container will be reused on next mount
  }, []); // Only run once on mount

  // UPDATE: Handle prop changes after initialization
  useEffect(() => {
    if (!vinylRenderer.isInitialized()) {
      return;
    }

    console.log("[VinylDisc] Updating renderer params:", {
      trackId: track.id,
      albumColor: track.coverColor,
      artworkUrl: track.artworkUrl,
      isPlaying,
    });

    vinylRenderer.updateParams({
      trackId: track.id,
      albumColor: track.coverColor,
      artworkUrl: track.artworkUrl, // Update artwork in p5
      isPlaying,
      progress,
    });
  }, [track.id, track.coverColor, track.artworkUrl, isPlaying, progress]); // Update on any prop change

  const [showPlayIcon, setShowPlayIcon] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative w-full h-full z-10 cursor-pointer group"
      onClick={onPlayPause}
      onMouseEnter={() => setShowPlayIcon(true)}
      onMouseLeave={() => setShowPlayIcon(false)}
    >
      {/* P5 Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[400px]"
        style={{
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 text-sm">
            Loading...
          </div>
        )}
      </div>

      {/* Play/Pause Overlay - shows on hover or when paused */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: (showPlayIcon || !isPlaying) ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 12 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-20 h-20 rounded-full bg-black/50 dark:bg-white/20 backdrop-blur-md flex items-center justify-center"
        >
          {isPlaying ? (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
