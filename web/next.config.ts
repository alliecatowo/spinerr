import path from "node:path";
import type { NextConfig } from "next";

// Spinnerr is a static export served by Firebase Hosting. Server-side work
// (SoundCloud and calendar proxies, billing cap) lives in ../functions.
const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable to prevent double-mounting in dev
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },

  // Turbopack configuration for Next.js 16
  turbopack: {
    // The repo root has its own package-lock.json; pin the root to web/
    root: path.resolve(__dirname),
    resolveAlias: {
      // Use browser-specific build of jsmediatags to avoid React Native dependencies
      jsmediatags: "jsmediatags/dist/jsmediatags.js",
    },
  },
};

export default nextConfig;
