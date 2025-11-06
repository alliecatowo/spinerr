"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Library, Music, Play, Settings, Maximize2, Minimize2, MonitorPlay } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibraryStore, usePlayerStore, useViewModeStore } from "@/lib/store";
import { AlbumSearchModal } from "@/components/library/AlbumSearchModal";
import type { Album } from "@/lib/providers/types";
import { cn } from "@/lib/utils";
import { useFullscreen } from "@/hooks/useFullscreen";
import { AccountButton } from "@/components/auth/AccountButton";
import { ThemeToggle } from "./ThemeToggle";

export function AppSidebar() {
  const router = useRouter();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  const recentlyPlayed = useLibraryStore((state) => state.recentlyPlayed);
  const albums = useLibraryStore((state) => state.albums);
  const loadAlbum = usePlayerStore((state) => state.loadAlbum);
  const addAlbum = useLibraryStore((state) => state.addAlbum);
  const addToRecentlyPlayed = useLibraryStore((state) => state.addToRecentlyPlayed);

  const { toggleTheaterMode, isTheaterMode, toggleInfo } = useViewModeStore();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const handleFullscreenToggle = async () => {
    await toggleFullscreen();
  };

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

  const displayedRecentlyPlayed = recentlyPlayed.slice(0, 5);

  return (
    <>
      <Sidebar>
        <SidebarContent>
          {/* Recently Played */}
          <SidebarGroup>
            <SidebarGroupLabel>Recently Played</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {displayedRecentlyPlayed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
                    <Music className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-xs">No recent albums</p>
                  </div>
                ) : (
                  displayedRecentlyPlayed.map((album) => (
                    <SidebarMenuItem key={`${album.provider}-${album.id}`}>
                      <SidebarMenuButton
                        onClick={() => handleAlbumClick(album)}
                        className="group h-auto py-2"
                      >
                        <div className="flex items-center gap-3 w-full">
                          {/* Album Artwork */}
                          <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 flex-shrink-0">
                            {album.artworkUrl ? (
                              <img
                                src={album.artworkUrl}
                                alt={album.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-white">
                                <Music className="h-5 w-5" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="h-4 w-4 text-white" fill="white" />
                            </div>
                          </div>

                          {/* Album Info */}
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium truncate">{album.title}</p>
                            <p className="text-xs text-neutral-500 truncate">{album.artist}</p>
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => router.push("/library")}>
                    <Library className="h-4 w-4" />
                    <span>Library</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => router.push("/settings")}>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setIsSearchModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    <span>Add Album</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Search Library */}
          <SidebarGroup>
            <SidebarGroupLabel>Search Library</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Search albums..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>

                {/* Search Results */}
                {localSearchQuery.trim() && (
                  <div className="max-h-48 overflow-y-auto rounded-lg bg-neutral-50 dark:bg-neutral-800/50 p-2 space-y-1">
                    {filteredAlbums.length === 0 ? (
                      <p className="text-center py-4 text-xs text-neutral-500">No matches found</p>
                    ) : (
                      filteredAlbums.slice(0, 5).map((album) => (
                        <button
                          key={`${album.provider}-${album.id}`}
                          onClick={() => {
                            handleAlbumClick(album);
                            setLocalSearchQuery("");
                          }}
                          className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                        >
                          <div className="h-8 w-8 rounded overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 flex-shrink-0">
                            {album.artworkUrl ? (
                              <img
                                src={album.artworkUrl}
                                alt={album.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-white">
                                <Music className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs font-medium truncate">{album.title}</p>
                            <p className="text-xs text-neutral-500 truncate">{album.artist}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* View Controls */}
          <SidebarGroup>
            <SidebarGroupLabel>View</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={toggleTheaterMode}>
                    <MonitorPlay className="h-4 w-4" />
                    <span>Theater Mode</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleFullscreenToggle}>
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    <span>Fullscreen</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={toggleInfo}>
                    <Play className="h-4 w-4" />
                    <span>Toggle Info</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer - Account & Theme */}
        <SidebarFooter>
          <div className="flex items-center justify-between px-2 py-2">
            <ThemeToggle />
            <AccountButton />
          </div>
        </SidebarFooter>
      </Sidebar>

      <AlbumSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectAlbum={handleAddAlbum}
      />
    </>
  );
}
