import type { MetadataRoute } from "next";

/**
 * Web App Manifest — served at /manifest.webmanifest via Next's file-based
 * metadata route. Backed by /public/icons/* (regenerate with
 * `npx tsx scripts/gen-icons.ts`).
 *
 * Background + theme colors are pinned to the light palette; in dark mode
 * the system applies its own background to the splash screen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fokus",
    short_name: "Fokus",
    description: "One small moment a day with your child.",
    start_url: "/today",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    categories: ["education", "lifestyle", "parenting"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
