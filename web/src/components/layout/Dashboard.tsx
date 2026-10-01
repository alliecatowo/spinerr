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
      <div className="flex h-screen w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        {/* Left Sidebar - collapsed in theater/fullscreen */}
        <AppSidebar />

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col relative overflow-hidden">
          {/* Floating Sidebar Toggle - only show when sidebar is collapsed */}
          {!sidebarOpen && (
            <div className="fixed top-4 left-4 z-50">
              <SidebarTrigger />
            </div>
          )}

          {/* Main Content - Two halves, vinyl dominates */}
          <main className="flex-1 w-full overflow-auto flex items-center justify-center">
            {showInfo && !isTheaterMode ? (
              // Two column layout when showing info
              <div className="w-full h-full flex flex-col lg:flex-row overflow-auto">
                {/* Left Half - Vinyl Player */}
                <div className="flex-1 flex items-center justify-center p-4 min-w-0 min-h-0">
                  <div className="w-full h-full max-w-3xl max-h-3xl">
                    {musicSection}
                  </div>
                </div>

                {/* Right Half - At a Glance */}
                <div className="hidden lg:flex flex-1 items-center justify-center p-8 min-w-0 min-h-0 overflow-auto">
                  <div className="w-full max-w-2xl">
                    <AtAGlance />
                  </div>
                </div>
              </div>
            ) : (
              // Single column centered when no info (theater/fullscreen)
              <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
                <div className="w-full h-full max-w-4xl max-h-4xl">
                  {musicSection}
                </div>
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
