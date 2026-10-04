"use client";

import { useState, useEffect } from "react";
import { Music, Loader2, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocalFilePicker } from "@/components/music/LocalFilePicker";
import type { Album, Track } from "@/lib/providers/types";
import { SOURCE_LABEL } from "@/lib/sources/rank";
import type { SourceStatus } from "@/lib/sources/search";

interface AlbumSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlbum: (album: Album) => void;
}

const QUEUE_LENGTH = 12;

/** Build a playable record from one chosen result plus the results after it. */
function queueFrom(results: Track[], index: number): Album {
  const chosen = results[index];
  const rest = [...results.slice(index + 1), ...results.slice(0, index)].slice(0, QUEUE_LENGTH - 1);
  const tracks = [chosen, ...rest];
  return {
    id: `q-${chosen.id}`,
    provider: chosen.provider,
    title: chosen.title,
    artist: chosen.artist,
    artworkUrl: chosen.artworkUrl,
    trackCount: tracks.length,
    tracks,
    duration: tracks.reduce((sum, t) => sum + t.duration, 0),
    externalUrl: chosen.externalUrl,
  };
}

export function AlbumSearchModal({ isOpen, onClose, onSelectAlbum }: AlbumSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [statuses, setStatuses] = useState<SourceStatus[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search across every source at once
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { unifiedSearch } = await import("@/lib/sources/search");
        const found = await unifiedSearch(q, controller.signal);
        if (controller.signal.aborted) return;
        setResults(found.tracks);
        setStatuses(found.statuses);
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setStatuses([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setQuery("");
      setResults([]);
      setStatuses([]);
      setLoading(false);
      onClose();
    }
  };

  const visible = query.trim() ? results : [];
  const allFailed = statuses.length > 0 && statuses.every((s) => !s.ok);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Search music</DialogTitle>
          <DialogDescription>
            One search across Audius, SoundCloud, the Internet Archive and live radio. Pick a result to spin it.
          </DialogDescription>
        </DialogHeader>

        <Command shouldFilter={false} className="rounded-none border-0 mt-4">
          <CommandInput placeholder="Search for a song, artist or station..." value={query} onValueChange={setQuery} />
          <CommandList className="max-h-none">
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                </div>
              ) : allFailed ? (
                <div className="px-6 py-8 text-center">
                  <p className="mb-3 text-sm text-muted-foreground">
                    The music sources aren&apos;t answering. Check your connection, or play your own files.
                  </p>
                  <LocalFilePicker onLoaded={onClose} />
                </div>
              ) : query.trim() ? (
                <div className="py-8 text-center">
                  <Music className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p>No music found for &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">Start typing to search</div>
              )}
            </CommandEmpty>

            {visible.length > 0 && (
              <ScrollArea className="h-[50vh]">
                <div className="p-2">
                  {visible.map((track, i) => (
                    <CommandItem
                      key={track.id}
                      value={track.id}
                      onSelect={() => {
                        onSelectAlbum(queueFrom(visible, i));
                        onClose();
                      }}
                      className="cursor-pointer gap-3 rounded-lg p-2"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-200 dark:bg-neutral-800">
                        {track.artworkUrl ? (
                          <img src={track.artworkUrl} alt="" className="h-full w-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        ) : track.provider === "radio" ? (
                          <Radio className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Music className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">{track.title}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{track.artist}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {SOURCE_LABEL[track.provider] ?? track.provider}
                      </Badge>
                    </CommandItem>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
