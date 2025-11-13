"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Album, ProviderId } from "@/lib/providers/types";
import { providerManager } from "@/lib/providers/provider-manager";
import type { SearchResult } from "@/lib/providers/provider-manager";

interface AlbumSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlbum: (album: Album) => void;
}

export function AlbumSearchModal({ isOpen, onClose, onSelectAlbum }: AlbumSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterProvider, setFilterProvider] = useState<ProviderId | undefined>(undefined);

  // Search function with provider manager
  const searchAlbums = useCallback(async (searchQuery: string, provider?: ProviderId) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await providerManager.searchAlbums(searchQuery, provider);
      setResults(searchResults);
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
        searchAlbums(query, filterProvider);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, filterProvider, searchAlbums]);

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

  const handleAlbumClick = async (result: SearchResult) => {
    try {
      // If album already has tracks, use it directly
      if (result.album.tracks.length > 0) {
        onSelectAlbum(result.album);
        onClose();
        return;
      }

      // For SoundCloud, fetch full playlist details
      if (result.provider === 'soundcloud') {
        const id = result.album.id.replace('soundcloud-', '');
        const response = await fetch(`/api/soundcloud/playlist?id=${id}`);
        if (!response.ok) throw new Error("Failed to fetch album details");

        const data = await response.json();
        const fullPlaylist = data.playlist;

        // Update album with full track list
        result.album.tracks = (fullPlaylist.tracks || []).map((track: any) => ({
          id: `soundcloud-${track.id}`,
          provider: "soundcloud" as const,
          title: track.title,
          artist: track.artist,
          album: fullPlaylist.title,
          artworkUrl: track.artworkUrl || fullPlaylist.artworkUrl,
          duration: Math.floor(track.duration / 1000),
          externalUrl: track.permalinkUrl,
          streamUrl: track.streamUrl,
        }));
      }

      // For Spotify, fetch album tracks
      else if (result.provider === 'spotify') {
        const spotifyClient = providerManager.getSpotifyClient();
        if (spotifyClient) {
          // Fetch album tracks from Spotify API
          const albumData = await fetch(`https://api.spotify.com/v1/albums/${result.album.id}/tracks`, {
            headers: {
              'Authorization': `Bearer ${(spotifyClient as any).accessToken}`
            }
          });

          if (albumData.ok) {
            const tracksData = await albumData.json();
            result.album.tracks = tracksData.items.map((track: any) => ({
              id: track.id,
              provider: "spotify" as const,
              title: track.name,
              artist: track.artists[0]?.name || 'Unknown',
              album: result.album.title,
              artworkUrl: result.album.artworkUrl,
              duration: Math.floor(track.duration_ms / 1000),
              externalUrl: track.external_urls.spotify,
            }));
          }
        }
      }

      onSelectAlbum(result.album);
      onClose();
    } catch (err) {
      console.error("Failed to fetch album details:", err);
      setError("Failed to load album details");
    }
  };

  // Provider badge helper
  const getProviderBadge = (provider: ProviderId) => {
    switch (provider) {
      case 'spotify':
        return <Badge className="bg-green-600 hover:bg-green-700">Spotify</Badge>;
      case 'soundcloud':
        return <Badge className="bg-orange-600 hover:bg-orange-700">SoundCloud</Badge>;
      default:
        return null;
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
              <div className="relative mb-4">
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

              {/* Provider Filter */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filterProvider === undefined ? "default" : "outline"}
                  onClick={() => setFilterProvider(undefined)}
                >
                  All Sources
                </Button>
                {providerManager.isProviderAvailable('spotify') && (
                  <Button
                    size="sm"
                    variant={filterProvider === 'spotify' ? "default" : "outline"}
                    onClick={() => setFilterProvider('spotify')}
                    className={filterProvider === 'spotify' ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    Spotify
                  </Button>
                )}
                {providerManager.isProviderAvailable('soundcloud') && (
                  <Button
                    size="sm"
                    variant={filterProvider === 'soundcloud' ? "default" : "outline"}
                    onClick={() => setFilterProvider('soundcloud')}
                    className={filterProvider === 'soundcloud' ? "bg-orange-600 hover:bg-orange-700" : ""}
                  >
                    SoundCloud
                  </Button>
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
                {results.map((result) => (
                  <motion.div
                    key={`${result.provider}-${result.album.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="cursor-pointer group"
                    onClick={() => handleAlbumClick(result)}
                  >
                    <div className="relative aspect-square mb-2 rounded-lg overflow-hidden bg-gray-200 dark:bg-neutral-800 shadow-lg group-hover:shadow-xl transition-shadow">
                      {result.album.artworkUrl ? (
                        <img
                          src={result.album.artworkUrl}
                          alt={result.album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="h-12 w-12 text-gray-400 dark:text-neutral-600" />
                        </div>
                      )}
                      {/* Provider Badge */}
                      <div className="absolute top-2 right-2">
                        {getProviderBadge(result.provider)}
                      </div>
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
                      {result.album.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-neutral-400 line-clamp-1">
                      {result.album.artist}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
                      {result.album.trackCount} tracks
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
