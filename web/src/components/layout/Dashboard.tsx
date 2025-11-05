"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useViewModeStore } from "@/lib/store";
import { useFullscreen } from "@/hooks/useFullscreen";
import { ThemeToggle } from "./ThemeToggle";
import { AppSidebar } from "./AppSidebar";
import { AccountButton } from "@/components/auth/AccountButton";
import { AtAGlance } from "./AtAGlance";
import { HelpButton } from "@/components/tours/HelpButton";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardProps {
  musicSection: React.ReactNode;
}

export function Dashboard({ musicSection }: DashboardProps) {
  const { viewMode, showInfo, enterAmbientMode, exitAmbientMode } = useViewModeStore();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const isAmbient = viewMode === 'ambient';
  const isMinimal = viewMode === 'minimal';


  const handleAmbientToggle = async () => {
    if (isAmbient) {
      // Exit ambient mode and fullscreen
      exitAmbientMode();
      if (isFullscreen) {
        await toggleFullscreen();
      }
    } else {
      // Enter ambient mode and fullscreen
      enterAmbientMode();
      if (!isFullscreen) {
        await toggleFullscreen();
      }
    }
  };

  return (
    <SidebarProvider defaultOpen={!isAmbient}>
      <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950">
        {/* Left Sidebar - Using shadcn sidebar */}
        {!isAmbient && !isMinimal && <AppSidebar />}

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col">
          {/* Header Bar - Hidden in fullscreen */}
          {!isMinimal && !isFullscreen && (
            <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <div className="container flex h-16 items-center justify-between px-6">
                {/* Left Controls */}
                <div className="flex items-center gap-4">
                  {!isAmbient && <SidebarTrigger />}
                  <ThemeToggle />
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAmbientToggle}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      isAmbient || isFullscreen
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    )}
                    aria-label={isAmbient ? "Exit fullscreen mode" : "Enter fullscreen mode"}
                    title={isAmbient ? "Exit fullscreen mode" : "Enter fullscreen mode"}
                  >
                    {isAmbient || isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  </button>

                  <AccountButton />
                </div>
              </div>
            </header>
          )}

          {/* Main Content */}
          <main className="flex-1 w-full">
            <div className="h-full flex flex-col lg:flex-row items-center justify-evenly gap-8 p-8">
              {musicSection}
              {showInfo && !isMinimal && <AtAGlance />}
            </div>
          </main>

          {/* Help Button */}
          {!isAmbient && !isMinimal && <HelpButton />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
