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
    console.log("[VinylDisc] Component mounted, containerRef:", containerRef.current);

    if (!containerRef.current) {
      console.warn("[VinylDisc] No container ref on mount");
      return;
    }

    const container = containerRef.current;
    console.log("[VinylDisc] Container dimensions:", {
      offsetWidth: container.offsetWidth,
      offsetHeight: container.offsetHeight,
      clientWidth: container.clientWidth,
      clientHeight: container.clientHeight,
      boundingRect: container.getBoundingClientRect()
    });

    // Load p5.js dynamically
    const loadP5 = async () => {
      try {
        console.log("[VinylDisc] Loading p5.js...");

        // Check if p5 is already loaded
        if (!(window as any).p5) {
          const p5Module = await import("p5");
          (window as any).p5 = p5Module.default;
          console.log("[VinylDisc] p5.js loaded successfully");
        } else {
          console.log("[VinylDisc] p5.js already loaded");
        }

        // Wait a frame to ensure container has dimensions
        await new Promise(resolve => requestAnimationFrame(resolve));

        // Create the sketch
        if (containerRef.current) {
          const finalContainer = containerRef.current;
          console.log("[VinylDisc] Creating sketch with dimensions:", {
            width: finalContainer.offsetWidth,
            height: finalContainer.offsetHeight
          });

          cleanupRef.current = createVinylSketch(
            finalContainer,
            track.coverColor,
            isPlaying,
            progress,
            onSeek
          );

          console.log("[VinylDisc] Sketch created, cleanup ref:", !!cleanupRef.current);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[VinylDisc] Error loading p5.js or creating sketch:", error);
        setIsLoading(false);
      }
    };

    loadP5();

    // Cleanup on unmount
    return () => {
      console.log("[VinylDisc] Cleaning up sketch");
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
      console.log("[VinylDisc] Updating params, canvas found:", !!canvas);

      if (canvas && (canvas as any)._pInst) {
        const p5Instance = (canvas as any)._pInst;
        if (p5Instance.updateParams) {
          console.log("[VinylDisc] Calling updateParams with:", {
            albumColor: track.coverColor,
            isPlaying,
            progress
          });
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
      {/* P5 Canvas Container - with explicit min size and visible border for debugging */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[400px] border-4 border-red-500 bg-slate-100"
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
