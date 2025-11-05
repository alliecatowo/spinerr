"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Track } from "@/lib/store";
import { createVinylSketch } from "@/lib/vinyl-sketch";

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
  const p5InstanceRef = useRef<any>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Store frequently-changing values in refs to avoid stale closures
  const progressRef = useRef(progress);

  // Update refs when props change (but don't trigger re-renders)
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // INITIALIZATION: Create p5 sketch once on mount
  useEffect(() => {
    console.log("[VinylDisc] Mount effect - initializing p5 sketch");

    if (!containerRef.current) {
      console.error("[VinylDisc] No container ref available");
      return;
    }

    // Load p5.js dynamically
    const initializeP5 = async () => {
      try {
        // Check if p5 is already loaded
        if (!(window as any).p5) {
          console.log("[VinylDisc] Loading p5.js module...");
          const p5Module = await import("p5");
          (window as any).p5 = p5Module.default;
          console.log("[VinylDisc] p5.js loaded successfully");
        }

        // Wait a frame to ensure container has dimensions
        await new Promise(resolve => requestAnimationFrame(resolve));

        // Create the sketch
        if (containerRef.current) {
          console.log("[VinylDisc] Creating vinyl sketch...");
          const sketchInstance = createVinylSketch(
            containerRef.current,
            track.id, // Use track ID for unique art
            track.coverColor,
            undefined, // Artwork will be overlaid via React
            isPlaying,
            progress,
            undefined // No onSeek callback
          );

          // Store references
          p5InstanceRef.current = sketchInstance.p5Instance;
          cleanupRef.current = sketchInstance.cleanup;

          console.log("[VinylDisc] Sketch created successfully, p5Instance:", p5InstanceRef.current);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[VinylDisc] Error creating sketch:", error);
        setIsLoading(false);
      }
    };

    initializeP5();

    // Cleanup on unmount
    return () => {
      console.log("[VinylDisc] Unmounting, cleaning up...");
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      p5InstanceRef.current = null;
    };
  }, []); // Only run once on mount

  // UPDATE: Handle prop changes after initialization
  useEffect(() => {
    if (!p5InstanceRef.current) {
      console.log("[VinylDisc] Update effect - p5 instance not ready yet");
      return;
    }

    console.log("[VinylDisc] Update effect - updating params:", {
      trackId: track.id,
      albumColor: track.coverColor,
      isPlaying,
      hasUpdateParams: typeof (p5InstanceRef.current as any).updateParams === 'function'
    });

    // Call updateParams on the p5 instance
    if (typeof (p5InstanceRef.current as any).updateParams === 'function') {
      (p5InstanceRef.current as any).updateParams({
        trackId: track.id,
        albumColor: track.coverColor,
        artworkUrl: undefined,
        isPlaying,
        progress: progressRef.current,
        onSeek: undefined, // No seek callback for performance
      });
      console.log("[VinylDisc] updateParams called successfully");
    } else {
      console.error("[VinylDisc] updateParams method not found on p5 instance!");
    }
  }, [track.id, track.coverColor, isPlaying]); // Trigger on track ID, color, or play state change

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

      {/* Album Art Overlay - Rotates at 33⅓ RPM when playing */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden shadow-2xl pointer-events-none"
        style={{
          width: "30%",
          height: "30%",
          backgroundColor: track.coverColor,
          zIndex: 10
        }}
        initial={{ opacity: 0, scale: 0, rotate: 0 }}
        animate={{
          opacity: 1,
          scale: 1,
          rotate: isPlaying ? 360 : undefined // When paused, freeze at current rotation
        }}
        transition={{
          opacity: { delay: 0.4, duration: 0.5 },
          scale: { delay: 0.4, duration: 0.5 },
          rotate: isPlaying ? {
            duration: 1.8, // 33⅓ RPM = 1.8 seconds per rotation
            repeat: Infinity,
            ease: "linear"
          } : {
            duration: 0 // Instant stop when pausing
          }
        }}
      >
        {track.artworkUrl ? (
          <img
            src={track.artworkUrl}
            alt={track.album}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
            {track.album.charAt(0)}
          </div>
        )}
      </motion.div>

      {/* Center Spindle */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 rounded-full shadow-inner pointer-events-none"
        style={{ zIndex: 11 }}
      />

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
