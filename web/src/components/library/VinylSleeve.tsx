"use client";

import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Track } from "@/lib/store";
import { Play, Info } from "lucide-react";

interface VinylSleeveProps {
  track: Track;
  onClick?: () => void;
}

export const VinylSleeve = memo(function VinylSleeve({ track, onClick }: VinylSleeveProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/track/${track.id}`);
  };

  return (
    <motion.div
      className="relative w-full aspect-square cursor-pointer group"
      style={{ zIndex: isHovered ? 30 : 1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Vinyl Disc - BEHIND sleeve, slides out to the right */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] aspect-square pointer-events-none z-10"
        initial={{ x: 0 }}
        animate={{ x: isHovered ? "45%" : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Vinyl Disc - darker, more visible in dark mode */}
        <div
          className="relative w-full h-full rounded-full shadow-2xl ring-2 ring-white/10 dark:ring-white/20"
          style={{
            background: `radial-gradient(circle at center, ${track.coverColor}aa 0%, ${track.coverColor}99 8%, ${track.coverColor}77 12%, #2a2a2a 18%, #1a1a1a 40%, #0a0a0a 100%)`,
          }}
        >
          {/* Grooves - optimized count for performance */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border"
              style={{
                transform: `scale(${1 - i * 0.042})`,
                borderColor: i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.4)',
              }}
            />
          ))}

          {/* Center Label - vibrant */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] aspect-square rounded-full flex items-center justify-center text-white font-bold shadow-2xl ring-2 ring-black/30"
            style={{ backgroundColor: track.coverColor }}
          >
            <span className="text-3xl drop-shadow-lg">{track.album.charAt(0)}</span>
          </div>

          {/* Center Hole */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] ring-1 ring-white/20" />
        </div>
      </motion.div>

      {/* Sleeve - FRONT, classic vinyl sleeve style */}
      <div className="relative w-full h-full rounded-sm overflow-hidden shadow-2xl bg-gray-900 z-20">
        {/* Album Cover Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${track.coverColor} 0%, ${track.coverColor}ee 100%)`,
          }}
        />

        {/* Sleeve texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)`,
        }} />

        {/* Album Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
          <h3 className="text-2xl font-bold text-center mb-2 drop-shadow-lg">
            {track.title}
          </h3>
          <p className="text-lg opacity-90 drop-shadow">{track.artist}</p>
          <p className="text-sm opacity-70 mt-2">{track.album}</p>
        </div>

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.2 }}
            className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl"
          >
            <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
          </motion.div>
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            onClick={handleInfoClick}
            className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-gray-900 text-sm font-medium flex items-center gap-2 transition-colors shadow-lg pointer-events-auto"
          >
            <Info className="w-4 h-4" />
            Details
          </motion.button>
        </motion.div>

        {/* Sleeve opening shadow on right side - deeper */}
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-black/60 via-black/30 to-transparent pointer-events-none" />

        {/* Sleeve corner wear */}
        <div className="absolute inset-0 rounded-sm pointer-events-none ring-1 ring-inset ring-black/20" />
      </div>
    </motion.div>
  );
});
