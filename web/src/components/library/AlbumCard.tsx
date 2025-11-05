"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, MoreVertical, Trash2, Info, Music } from "lucide-react";
import type { Album } from "@/lib/providers/types";

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
  onRemove: () => void;
  onViewDetails: () => void;
}

export function AlbumCard({ album, onClick, onRemove, onViewDetails }: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onRemove();
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onViewDetails();
  };

  // Generate color from album title
  const getAlbumColor = () => {
    const colors = [
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#f59e0b", // amber
      "#10b981", // emerald
      "#3b82f6", // blue
      "#ef4444", // red
      "#06b6d4", // cyan
    ];
    const index = album.title.length % colors.length;
    return colors[index];
  };

  return (
    <motion.div
      className="relative cursor-pointer group"
      style={{ zIndex: isHovered ? 30 : 1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Menu Button */}
      <div className="absolute top-2 right-2 z-30" ref={menuRef}>
        <button
          onClick={handleMenuClick}
          className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {/* Context Menu */}
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl border border-gray-200 dark:border-neutral-700 overflow-hidden"
          >
            <button
              onClick={handlePlay}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-900 dark:text-white text-sm transition-colors"
            >
              <Play className="h-4 w-4" />
              Play
            </button>
            <button
              onClick={handleViewDetails}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-900 dark:text-white text-sm transition-colors"
            >
              <Info className="h-4 w-4" />
              View Details
            </button>
            <button
              onClick={handleRemove}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Remove from Library
            </button>
          </motion.div>
        )}
      </div>

      {/* Vinyl Disc - slides out on hover */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] aspect-square pointer-events-none z-10"
        initial={{ x: 0 }}
        animate={{ x: isHovered ? "45%" : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="relative w-full h-full rounded-full shadow-2xl ring-2 ring-white/10 dark:ring-white/20"
          style={{
            background: `radial-gradient(circle at center, ${getAlbumColor()}aa 0%, ${getAlbumColor()}99 8%, ${getAlbumColor()}77 12%, #2a2a2a 18%, #1a1a1a 40%, #0a0a0a 100%)`,
          }}
        >
          {/* Grooves */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border"
              style={{
                transform: `scale(${1 - i * 0.042})`,
                borderColor: i % 2 === 0 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.4)",
              }}
            />
          ))}

          {/* Center Label */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] aspect-square rounded-full flex items-center justify-center text-white font-bold shadow-2xl ring-2 ring-black/30"
            style={{ backgroundColor: getAlbumColor() }}
          >
            <span className="text-3xl drop-shadow-lg">{album.title.charAt(0)}</span>
          </div>

          {/* Center Hole */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] ring-1 ring-white/20" />
        </div>
      </motion.div>

      {/* Album Cover Sleeve */}
      <div
        className="relative w-full aspect-square rounded-sm overflow-hidden shadow-2xl z-20"
        onClick={onClick}
      >
        {/* Album Artwork or Placeholder */}
        {album.artworkUrl ? (
          <img
            src={album.artworkUrl}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center text-white"
            style={{
              background: `linear-gradient(135deg, ${getAlbumColor()} 0%, ${getAlbumColor()}ee 100%)`,
            }}
          >
            <Music className="h-16 w-16 mb-3 opacity-80" />
            <p className="text-lg font-bold px-4 text-center line-clamp-2">
              {album.title}
            </p>
          </div>
        )}

        {/* Sleeve texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)`,
          }}
        />

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.2 }}
            className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl"
            onClick={handlePlay}
          >
            <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
          </motion.div>
        </motion.div>

        {/* Sleeve opening shadow */}
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-black/60 via-black/30 to-transparent pointer-events-none" />

        {/* Border effect */}
        <div className="absolute inset-0 rounded-sm pointer-events-none ring-1 ring-inset ring-black/20" />
      </div>

      {/* Album Info */}
      <div className="mt-3 px-1">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
          {album.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-neutral-400 line-clamp-1">
          {album.artist}
        </p>
        <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
          {album.trackCount} tracks
        </p>
      </div>
    </motion.div>
  );
}
