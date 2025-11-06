"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
        <SidebarInset className="flex-1 flex flex-col">
          {/* Main Content - Two equal halves */}
          <main className="flex-1 w-full">
            <div className="h-full flex flex-col lg:flex-row">
              {/* Left Half - Vinyl Player (takes full square) */}
              <div className="flex-1 flex items-center justify-center p-8">
                {musicSection}
              </div>

              {/* Right Half - At a Glance (centered with space around) */}
              {showInfo && !isTheaterMode && (
                <div className="hidden lg:flex flex-1 items-center justify-center p-8">
                  <AtAGlance />
                </div>
              )}
            </div>
          </main>

          {/* Help Button - Hidden in fullscreen */}
          {!isFullscreen && <HelpButton />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
