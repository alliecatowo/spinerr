"use client";

import { Play, Plus, Clock, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const loadAlbum = usePlayerStore((state) => state.loadAlbum);

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
    loadAlbum(album);
    addToRecentlyPlayed(album);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{album.title}</DialogTitle>
        </DialogHeader>

        {/* Header with Album Art - Keep gradient design */}
        <div className="relative p-8 bg-gradient-to-br from-purple-600 to-purple-800 dark:from-purple-900 dark:to-purple-950">
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

        {/* Track List with ScrollArea */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tracks
          </h3>
          <ScrollArea className="h-[40vh]">
            <div className="space-y-1 pr-4">
              {album.tracks.map((track, index) => (
                <div
                  key={track.id}
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
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
