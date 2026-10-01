"use client";

import { useState, useEffect, useCallback } from "react";
import { Music, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Search Albums</DialogTitle>
          <DialogDescription>
            Search across all your connected music sources
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Provider Filter */}
          <div className="flex gap-2 px-6 pt-4">
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

          {/* Command Palette */}
          <Command className="rounded-none border-0 mt-4">
            <CommandInput
              placeholder="Search for albums, artists, or playlists..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  </div>
                ) : error ? (
                  <div className="text-center py-6 text-red-500">
                    {error}
                  </div>
                ) : query ? (
                  <div className="text-center py-8">
                    <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No albums found for "{query}"</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>Start typing to search for albums</p>
                  </div>
                )}
              </CommandEmpty>

              {results.length > 0 && (
                <ScrollArea className="h-[50vh]">
                  <CommandGroup heading="Search Results" className="p-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                      {results.map((result) => (
                        <CommandItem
                          key={`${result.provider}-${result.album.id}`}
                          onSelect={() => handleAlbumClick(result)}
                          className="cursor-pointer group p-0 h-auto rounded-lg flex-col items-start"
                        >
                          <div className="relative aspect-square w-full mb-2 rounded-lg overflow-hidden bg-gray-200 dark:bg-neutral-800 shadow-lg group-hover:shadow-xl transition-shadow">
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
                          </div>
                          <h3 className="font-semibold text-sm line-clamp-1 w-full px-1">
                            {result.album.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 w-full px-1">
                            {result.album.artist}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 px-1">
                            {result.album.trackCount} tracks
                          </p>
                        </CommandItem>
                      ))}
                    </div>
                  </CommandGroup>
                </ScrollArea>
              )}
            </CommandList>
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  );
}
