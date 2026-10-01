"use client";

import { useRef, useState, type ReactNode } from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createLocalAlbum } from "@/lib/local-files";
import { useLibraryStore, usePlayerStore } from "@/lib/store";

interface LocalFilePickerProps {
  /** Called after the picked files start playing (e.g. to close a dialog) */
  onLoaded?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: ReactNode;
}

/**
 * Pick audio files from this computer and play them as an album. Uses a
 * plain file input so it works in every browser (no File System Access API).
 */
export function LocalFilePicker({ onLoaded, variant = "default", size = "default", className, children }: LocalFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const loadAlbum = usePlayerStore((state) => state.loadAlbum);
  const setPlaybackError = usePlayerStore((state) => state.setPlaybackError);
  const addToRecentlyPlayed = useLibraryStore((state) => state.addToRecentlyPlayed);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow picking the same files again
    if (files.length === 0) return;

    setLoading(true);
    try {
      const album = await createLocalAlbum(files);
      if (!album) {
        setPlaybackError("None of those files look like audio. Try MP3, WAV, OGG, M4A or FLAC.");
        return;
      }
      addToRecentlyPlayed(album);
      loadAlbum(album);
      onLoaded?.();
    } catch (error) {
      console.error("[LocalFilePicker] Failed to load files:", error);
      setPlaybackError("Those files could not be read.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac,.opus"
        multiple
        className="hidden"
        data-testid="local-file-input"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderOpen className="h-4 w-4" />}
        {children ?? "Play files from your computer"}
      </Button>
    </>
  );
}
