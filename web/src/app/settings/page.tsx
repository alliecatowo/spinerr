"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SpotifySettings } from "@/components/settings/SpotifySettings";
import { SoundCloudSettings } from "@/components/settings/SoundCloudSettings";
import { YouTubeSettings } from "@/components/settings/YouTubeSettings";
import { CalendarSettings } from "@/components/settings/CalendarSettings";
import { LocalFilesSettings } from "@/components/settings/LocalFilesSettings";
import { GeneralSettings } from "@/components/settings/GeneralSettings";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 py-12 px-8">
      {/* Theme Toggle - top left */}
      <div className="fixed top-6 left-6 z-50">
        <ThemeToggle />
      </div>

      {/* Back Button - top right */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-neutral-400">
            Configure your music player and integrations
          </p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GeneralSettings />
          </motion.div>

          {/* SoundCloud Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SoundCloudSettings />
          </motion.div>

          {/* YouTube Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <YouTubeSettings />
          </motion.div>

          {/* Spotify Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <SpotifySettings />
          </motion.div>

          {/* Calendar Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <CalendarSettings />
          </motion.div>

          {/* Local Files */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <LocalFilesSettings />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
