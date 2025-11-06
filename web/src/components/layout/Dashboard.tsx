"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useViewModeStore } from "@/lib/store";
import { useFullscreen } from "@/hooks/useFullscreen";
import { AppSidebar } from "./AppSidebar";
import { AtAGlance } from "./AtAGlance";
import { HelpButton } from "@/components/tours/HelpButton";

interface DashboardProps {
  musicSection: React.ReactNode;
}

export function Dashboard({ musicSection }: DashboardProps) {
  const { showInfo, isTheaterMode } = useViewModeStore();
  const { isFullscreen } = useFullscreen();

  // Collapse sidebar in theater mode or fullscreen
  const sidebarOpen = !isTheaterMode && !isFullscreen;

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={() => {}}>
      <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950">
        {/* Left Sidebar - collapsed in theater/fullscreen */}
        <AppSidebar />

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col relative">
          {/* Floating Sidebar Toggle - only show when sidebar is collapsed */}
          {!sidebarOpen && (
            <div className="fixed top-4 left-4 z-50">
              <SidebarTrigger />
            </div>
          )}

          {/* Main Content - Two halves, vinyl dominates */}
          <main className="flex-1 w-full overflow-hidden flex items-center justify-center">
            {showInfo && !isTheaterMode ? (
              // Two column layout when showing info
              <div className="w-full h-full flex flex-col lg:flex-row">
                {/* Left Half - Vinyl Player (huge, takes almost entire space) */}
                <div className="flex-1 flex items-center justify-center p-4 min-h-0">
                  {musicSection}
                </div>

                {/* Right Half - At a Glance (centered with generous space) */}
                <div className="hidden lg:flex flex-1 items-center justify-center p-12 min-h-0">
                  <AtAGlance />
                </div>
              </div>
            ) : (
              // Single column centered when no info (theater/fullscreen)
              <div className="w-full h-full flex items-center justify-center p-8">
                {musicSection}
              </div>
            )}
          </main>

          {/* Help Button - Hidden in fullscreen */}
          {!isFullscreen && <HelpButton />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
