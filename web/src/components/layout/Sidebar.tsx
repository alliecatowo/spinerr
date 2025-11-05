"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Library, Music, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibraryStore, usePlayerStore } from "@/lib/store";
import { AlbumSearchModal } from "@/components/library/AlbumSearchModal";
import type { Album } from "@/lib/providers/types";

export function Sidebar() {
  const router = useRouter();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  const recentlyPlayed = useLibraryStore((state) => state.recentlyPlayed);
  const albums = useLibraryStore((state) => state.albums);
  const loadAlbum = usePlayerStore((state) => state.loadAlbum);
  const addAlbum = useLibraryStore((state) => state.addAlbum);
  const addToRecentlyPlayed = useLibraryStore((state) => state.addToRecentlyPlayed);

  // Filter library based on local search query
  const filteredAlbums = localSearchQuery.trim()
    ? albums.filter(
        (album) =>
          album.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
          album.artist.toLowerCase().includes(localSearchQuery.toLowerCase())
      )
    : [];

  const handleAlbumClick = (album: Album) => {
    loadAlbum(album);
    addToRecentlyPlayed(album);
  };

  const handleAddAlbum = (album: Album) => {
    addAlbum(album);
    addToRecentlyPlayed(album);
    loadAlbum(album);
  };

  // Show only first 5 recently played albums
  const displayedRecentlyPlayed = recentlyPlayed.slice(0, 5);

  return (
    <>
      {/* Sidebar - Relative position within flex layout */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-[280px] h-full overflow-y-auto px-6 py-4"
      >
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-neutral-800/50 overflow-hidden">
          {/* Recently Played Section */}
          <div className="p-4 border-b border-gray-200/50 dark:border-neutral-800/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Recently Played
            </h3>

            {displayedRecentlyPlayed.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-neutral-400">
                <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No recent albums</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                {displayedRecentlyPlayed.map((album) => (
                  <motion.div
                    key={`${album.provider}-${album.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleAlbumClick(album)}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors group"
                  >
                    {/* Mini Album Artwork */}
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-700 shadow-md">
                      {album.artworkUrl ? (
                        <img
                          src={album.artworkUrl}
                          alt={album.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <Music className="h-5 w-5" />
                        </div>
                      )}
                      {/* Play overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-4 w-4 text-white" fill="white" />
                      </div>
                    </div>

                    {/* Album Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {album.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-1">
                        {album.artist}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Section */}
          <div className="p-4 border-b border-gray-200/50 dark:border-neutral-800/50 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Quick Actions
            </h3>

            <Button
              onClick={() => router.push("/library")}
              variant="outline"
              className="w-full justify-start gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              <Library className="h-4 w-4" />
              <span className="text-sm">Browse Library</span>
            </Button>

            <Button
              onClick={() => setIsSearchModalOpen(true)}
              variant="outline"
              className="w-full justify-start gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add Album</span>
            </Button>
          </div>

          {/* Library Search Section */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Search Library
            </h3>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search your albums..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-gray-100 dark:bg-neutral-800 border-0 focus-visible:ring-2 focus-visible:ring-purple-500"
              />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {localSearchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-2"
                >
                  {filteredAlbums.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-500 dark:text-neutral-400">
                      No matches found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredAlbums.slice(0, 5).map((album) => (
                        <motion.div
                          key={`${album.provider}-${album.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => {
                            handleAlbumClick(album);
                            setLocalSearchQuery("");
                          }}
                          className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-white dark:hover:bg-neutral-700 transition-colors group"
                        >
                          <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-700">
                            {album.artworkUrl ? (
                              <img
                                src={album.artworkUrl}
                                alt={album.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white">
                                <Music className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                              {album.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-1">
                              {album.artist}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Album Search Modal */}
      <AlbumSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectAlbum={handleAddAlbum}
      />
    </>
  );
}
