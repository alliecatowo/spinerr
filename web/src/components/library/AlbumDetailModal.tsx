"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Plus, Clock, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Album } from "@/lib/providers/types";
import { useLibraryStore, usePlayerStore } from "@/lib/store";

interface AlbumDetailModalProps {
  album: Album | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AlbumDetailModal({ album, isOpen, onClose }: AlbumDetailModalProps) {
  const addAlbum = useLibraryStore((state) => state.addAlbum);
  const addToRecentlyPlayed = useLibraryStore((state) => state.addToRecentlyPlayed);
  const albums = useLibraryStore((state) => state.albums);
  const setPlaylist = usePlayerStore((state) => state.setPlaylist);
  const setTrack = usePlayerStore((state) => state.setTrack);
  const play = usePlayerStore((state) => state.play);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!album) return null;

  const isInLibrary = albums.some(
    (a) => a.id === album.id && a.provider === album.provider
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const handleAddToLibrary = () => {
    addAlbum(album);
    onClose();
  };

  const handlePlayNow = () => {
    // Convert Album tracks to player Track format
    const playerTracks = album.tracks.map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: album.title,
      duration: track.duration,
      coverColor: "#8b5cf6", // Purple for SoundCloud tracks
      genre: track.metadata?.genre,
    }));

    setPlaylist(playerTracks);
    if (playerTracks.length > 0) {
      setTrack(playerTracks[0]);
      play();
    }
    addToRecentlyPlayed(album);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Album Art */}
            <div className="relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Album Art & Info */}
              <div className="p-8 bg-gradient-to-br from-purple-600 to-purple-800 dark:from-purple-900 dark:to-purple-950">
                <div className="flex gap-6">
                  <div className="w-48 h-48 rounded-lg overflow-hidden shadow-2xl flex-shrink-0 bg-white/10">
                    {album.artworkUrl ? (
                      <img
                        src={album.artworkUrl}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-20 w-20 text-white/40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-end text-white">
                    <p className="text-sm font-medium mb-2 opacity-90">Album</p>
                    <h2 className="text-3xl font-bold mb-3 line-clamp-2">
                      {album.title}
                    </h2>
                    <p className="text-lg mb-2 opacity-90">{album.artist}</p>
                    <div className="flex items-center gap-4 text-sm opacity-80">
                      <span>{album.trackCount} tracks</span>
                      <span>•</span>
                      <span>{formatTotalDuration(album.duration)}</span>
                      {album.year && (
                        <>
                          <span>•</span>
                          <span>{album.year}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handlePlayNow}
                    className="bg-white text-purple-900 hover:bg-gray-100 font-semibold"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" fill="currentColor" />
                    Play Now
                  </Button>
                  {!isInLibrary && (
                    <Button
                      onClick={handleAddToLibrary}
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                      size="lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add to Library
                    </Button>
                  )}
                  {isInLibrary && (
                    <div className="px-4 py-2 bg-white/20 rounded-lg text-white text-sm flex items-center">
                      In your library
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Track List */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tracks
              </h3>
              <div className="space-y-1">
                {album.tracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <span className="w-6 text-sm text-gray-500 dark:text-neutral-500 text-right">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {track.title}
                      </p>
                      {track.artist !== album.artist && (
                        <p className="text-sm text-gray-600 dark:text-neutral-400 truncate">
                          {track.artist}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-500">
                      <Clock className="h-4 w-4" />
                      {formatDuration(track.duration)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
