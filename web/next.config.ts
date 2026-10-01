import path from "node:path";
import type { NextConfig } from "next";

// `pnpm build:static` sets this to produce a plain static export (out/) for
// Firebase Hosting. That build has no server, so the SoundCloud proxy route
// handlers (app/api/**/route.ts) are left out by only treating .tsx files as
// routes, and the UI hides SoundCloud (see src/lib/runtime.ts).
const isStaticExport = process.env.NEXT_PUBLIC_SPINERR_STATIC === "1";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable to prevent double-mounting in dev

  ...(isStaticExport && {
    output: "export",
    trailingSlash: true,
    pageExtensions: ["tsx"],
    images: { unoptimized: true },
  }),

  // Exclude Node.js-only packages from server bundle
  // These packages should only be used in server-side code (API routes)
  serverExternalPackages: ["soundcloud.ts", "ffmpeg-static"],

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
