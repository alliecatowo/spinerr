import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable to prevent double-mounting in dev

  // Exclude Node.js-only packages from server bundle
  // These packages should only be used in server-side code (API routes)
  serverExternalPackages: ['soundcloud.ts', 'ffmpeg-static'],

  // Turbopack configuration for Next.js 16
  turbopack: {
    resolveAlias: {
      // Use browser-specific build of jsmediatags to avoid React Native dependencies
      'jsmediatags': 'jsmediatags/dist/jsmediatags.js',
    },
  },
};

export default nextConfig;
