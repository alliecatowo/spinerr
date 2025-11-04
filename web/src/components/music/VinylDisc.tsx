"use client";

import { useEffect, useRef } from "react";
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
  const updateParamsRef = useRef<any>(null);

  // Initialize sketch on mount
  useEffect(() => {
    if (!containerRef.current) return;

    // Load p5.js dynamically
    const loadP5 = async () => {
      // Check if p5 is already loaded
      if (!(window as any).p5) {
        const p5Module = await import("p5");
        (window as any).p5 = p5Module.default;
      }

      // Create the sketch
      if (containerRef.current) {
        cleanupRef.current = createVinylSketch(
          containerRef.current,
          track.coverColor,
          isPlaying,
          progress,
          onSeek
        );
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

  // Update sketch when props change
  useEffect(() => {
    if (containerRef.current && (window as any).p5) {
      // Find the p5 instance and update its params
      const canvas = containerRef.current.querySelector("canvas");
      if (canvas && (canvas as any)._pInst) {
        const p5Instance = (canvas as any)._pInst;
        if (p5Instance.updateParams) {
          p5Instance.updateParams({
            albumColor: track.coverColor,
            isPlaying,
            progress,
            onSeek,
          });
        }
      }
    }
  }, [track.coverColor, isPlaying, progress, onSeek]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative w-full h-full"
    >
      {/* P5 Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Album Art Overlay */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden shadow-2xl pointer-events-none"
        style={{
          width: "30%",
          height: "30%",
          backgroundColor: track.coverColor,
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 rounded-full shadow-inner pointer-events-none" />
    </motion.div>
  );
}
