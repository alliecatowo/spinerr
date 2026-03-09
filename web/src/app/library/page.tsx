"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Search, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlbumCard } from "@/components/library/AlbumCard";
import { AlbumSearchModal } from "@/components/library/AlbumSearchModal";
import { AlbumDetailModal } from "@/components/library/AlbumDetailModal";
import { GridSizeControl } from "@/components/library/GridSizeControl";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useLibraryStore, usePlayerStore } from "@/lib/store";
import type { Album } from "@/lib/providers/types";

export default function LibraryPage() {
  const router = useRouter();
  const [gridSize, setGridSize] = useState(4);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Library store
  const albums = useLibraryStore((state) => state.albums);
  const recentlyPlayed = useLibraryStore((state) => state.recentlyPlayed);
  const addAlbum = useLibraryStore((state) => state.addAlbum);
  const removeAlbum = useLibraryStore((state) => state.removeAlbum);
  const addToRecentlyPlayed = useLibraryStore((state) => state.addToRecentlyPlayed);

  // Player store
  const setPlaylist = usePlayerStore((state) => state.setPlaylist);
  const setTrack = usePlayerStore((state) => state.setTrack);
  const play = usePlayerStore((state) => state.play);

  // Filter albums by search query
  const filteredAlbums = albums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAlbumClick = (album: Album) => {
    // Convert Album tracks to player Track format
    const playerTracks = album.tracks.map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: album.title,
      duration: track.duration,
      coverColor: "#8b5cf6", // Purple for library tracks
      genre: track.metadata?.genre,
    }));

    setPlaylist(playerTracks);
    if (playerTracks.length > 0) {
      setTrack(playerTracks[0]);
      play();
    }
    addToRecentlyPlayed(album);
    router.push("/");
  };

  const handleViewDetails = (album: Album) => {
    setSelectedAlbum(album);
    setShowDetailModal(true);
  };

  const handleRemoveAlbum = (albumId: string) => {
    removeAlbum(albumId);
  };

  const handleSelectAlbum = (album: Album) => {
    addAlbum(album);
    setSelectedAlbum(album);
    setShowDetailModal(true);
  };

  const getGridClasses = () => {
    switch (gridSize) {
      case 2:
        return "grid-cols-2";
      case 3:
        return "md:grid-cols-3";
      case 4:
        return "md:grid-cols-3 lg:grid-cols-4";
      case 5:
        return "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      case 6:
        return "md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
      default:
        return "md:grid-cols-3 lg:grid-cols-4";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 py-12 px-8">
      {/* Theme Toggle - top left */}
      <div className="fixed top-6 left-6 z-50">
        <ThemeToggle />
      </div>

      {/* Back Button - top right */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="container mx-auto max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-start justify-between flex-wrap gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Your Library
              </h1>
              <p className="text-lg text-gray-600 dark:text-neutral-400">
                {albums.length} {albums.length === 1 ? "album" : "albums"} in your
                collection
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowSearchModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Album
              </Button>
              <GridSizeControl size={gridSize} onChange={setGridSize} />
            </div>
          </div>

          {/* Search Filter */}
          {albums.length > 0 && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your library..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-neutral-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}
        </motion.div>

        {/* Recently Played Section */}
        {recentlyPlayed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Recently Played
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
              {recentlyPlayed.slice(0, 10).map((album) => (
                <div key={album.id} className="flex-shrink-0 w-48">
                  <AlbumCard
                    album={album}
                    onClick={() => handleAlbumClick(album)}
                    onRemove={() => handleRemoveAlbum(album.id)}
                    onViewDetails={() => handleViewDetails(album)}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Albums Grid */}
        {filteredAlbums.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              All Albums
            </h2>
            <div className={`grid ${getGridClasses()} gap-x-16 gap-y-8`}>
              {filteredAlbums.map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <AlbumCard
                    album={album}
                    onClick={() => handleAlbumClick(album)}
                    onRemove={() => handleRemoveAlbum(album.id)}
                    onViewDetails={() => handleViewDetails(album)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : albums.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-6">
              <Music2 className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Your library is empty
            </h3>
            <p className="text-gray-600 dark:text-neutral-400 mb-6 text-center max-w-md">
              Add an album from SoundCloud to get started with your collection
            </p>
            <Button
              onClick={() => setShowSearchModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Album
            </Button>
          </motion.div>
        ) : (
          // No results for search
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500 dark:text-neutral-400"
          >
            <p>No albums found for &ldquo;{searchQuery}&rdquo;</p>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AlbumSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectAlbum={handleSelectAlbum}
      />
      <AlbumDetailModal
        album={selectedAlbum}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
}
