"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Album } from "@/lib/providers/types";
import type { SoundCloudPlaylist } from "@/lib/soundcloud-server";

interface AlbumSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlbum: (album: Album) => void;
}

export function AlbumSearchModal({ isOpen, onClose, onSelectAlbum }: AlbumSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SoundCloudPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search function with debounce
  const searchAlbums = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/soundcloud/albums?q=${encodeURIComponent(searchQuery)}&limit=20`
      );

      if (!response.ok) {
        throw new Error("Failed to search albums");
      }

      const data = await response.json();
      setResults(data.albums || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        searchAlbums(query);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, searchAlbums]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

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

  const handleAlbumClick = async (playlist: SoundCloudPlaylist) => {
    // Fetch full playlist details with all tracks
    try {
      const response = await fetch(`/api/soundcloud/playlist?id=${playlist.id}`);
      if (!response.ok) throw new Error("Failed to fetch album details");

      const data = await response.json();
      const fullPlaylist = data.playlist as SoundCloudPlaylist;

      // Convert to Album format
      const album: Album = {
        id: `soundcloud-${fullPlaylist.id}`,
        provider: "soundcloud",
        title: fullPlaylist.title,
        artist: fullPlaylist.user.username,
        artworkUrl: fullPlaylist.artworkUrl,
        trackCount: fullPlaylist.trackCount,
        duration: Math.floor(fullPlaylist.duration / 1000), // Convert ms to seconds
        externalUrl: fullPlaylist.permalinkUrl,
        tracks: (fullPlaylist.tracks || []).map((track) => ({
          id: `soundcloud-${track.id}`,
          provider: "soundcloud" as const,
          title: track.title,
          artist: track.artist,
          album: fullPlaylist.title,
          artworkUrl: track.artworkUrl || fullPlaylist.artworkUrl,
          duration: Math.floor(track.duration / 1000), // Convert ms to seconds
          externalUrl: track.permalinkUrl,
          streamUrl: track.streamUrl,
        })),
      };

      onSelectAlbum(album);
      onClose();
    } catch (err) {
      console.error("Failed to fetch album details:", err);
      setError("Failed to load album details");
    }
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
            className="w-full max-w-4xl max-h-[80vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Search Albums
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for albums, artists, or playlists..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-neutral-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500 animate-spin" />
                )}
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6">
              {error && (
                <div className="text-center py-8 text-red-500">
                  {error}
                </div>
              )}

              {!loading && !error && query && results.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-neutral-400">
                  <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No albums found for "{query}"</p>
                </div>
              )}

              {!query && !loading && (
                <div className="text-center py-12 text-gray-500 dark:text-neutral-400">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Start typing to search for albums</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((album) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="cursor-pointer group"
                    onClick={() => handleAlbumClick(album)}
                  >
                    <div className="relative aspect-square mb-2 rounded-lg overflow-hidden bg-gray-200 dark:bg-neutral-800 shadow-lg group-hover:shadow-xl transition-shadow">
                      {album.artworkUrl ? (
                        <img
                          src={album.artworkUrl}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="h-12 w-12 text-gray-400 dark:text-neutral-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <Button
                          size="sm"
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Add to Library
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                      {album.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-1">
                      {album.user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
                      {album.trackCount} tracks
                    </p>
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
