"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Track } from "@/lib/store";
import { createVinylSketch } from "@/lib/vinyl-sketch";

interface VinylDiscProps {
  track: Track;
  isPlaying: boolean;
  progress: number;
  onSeek?: (progress: number) => void;
}

export function VinylDisc({
  track,
  isPlaying,
  progress,
  onSeek,
}: VinylDiscProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize sketch on mount
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // Load p5.js dynamically
    const loadP5 = async () => {
      try {
        // Check if p5 is already loaded
        if (!(window as any).p5) {
          const p5Module = await import("p5");
          (window as any).p5 = p5Module.default;
        }

        // Wait a frame to ensure container has dimensions
        await new Promise(resolve => requestAnimationFrame(resolve));

        // Create the sketch
        if (containerRef.current) {
          cleanupRef.current = createVinylSketch(
            containerRef.current,
            track.coverColor,
            isPlaying,
            progress,
            onSeek
          );

          setIsLoading(false);
        }
      } catch (error) {
        console.error("[VinylDisc] Error creating sketch:", error);
        setIsLoading(false);
      }
    };

    loadP5();

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update sketch when IMPORTANT props change (NOT progress - too frequent!)
  useEffect(() => {
    if (containerRef.current && (window as any).p5) {
      const canvas = containerRef.current.querySelector("canvas");

      if (canvas && (canvas as any)._pInst) {
        const p5Instance = (canvas as any)._pInst;
        if (p5Instance.updateParams) {
          p5Instance.updateParams({
            albumColor: track.coverColor,
            isPlaying,
            progress, // Pass current value but don't trigger on every change
            onSeek,
          });
        }
      }
    }
  }, [track.coverColor, isPlaying]); // REMOVED progress and onSeek from deps!

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative w-full h-full z-10"
    >
      {/* P5 Canvas Container - with explicit min size and visible border for debugging */}
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
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-600 text-lg font-medium">
            Loading vinyl visualization...
          </div>
        )}
      </div>

      {/* Album Art Overlay */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden shadow-2xl pointer-events-none"
        style={{
          width: "30%",
          height: "30%",
          backgroundColor: track.coverColor,
          zIndex: 10
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
          {track.album.charAt(0)}
        </div>
      </motion.div>

      {/* Center Spindle */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 rounded-full shadow-inner pointer-events-none"
        style={{ zIndex: 11 }}
      />
    </motion.div>
  );
}
