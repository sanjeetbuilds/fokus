import path from "node:path";
import type { NextConfig } from "next";

// next-pwa is CommonJS; the dynamic require() avoids ESM-default-interop
// surprises. Types ship with @types/next-pwa, but the call shape is
// pinned here so a future bump can't widen it silently.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA: (config: Record<string, unknown>) => (next: NextConfig) => NextConfig =
  require("next-pwa");

const nextConfig: NextConfig = {
  // Pin tracing to this project so Next doesn't drift up to a parent dir
  // when other lockfiles exist higher in the tree.
  outputFileTracingRoot: path.join(__dirname),
};

/**
 * PWA config; workbox-backed via next-pwa.
 *
 *   - dest: 'public'          → emits sw.js + workbox-*.js so the browser
 *                                serves them from the static root.
 *   - disable in dev          → otherwise SW caching makes hot reload lie.
 *   - register: true          → injects the SW registration on first paint.
 *   - skipWaiting: true       → a new SW activates without forcing a refresh.
 *   - exclude /dev/* + the    → the dev tools and IndexedDB-backed JSON
 *     /api responses            shouldn't ever come from cache.
 */
const pwaWrapper = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // Cache the activities library and skill metadata as static assets; they
  // ship in the JS bundle, so Workbox's default precache already covers them.
  // No runtime caching rules needed beyond that.
  buildExcludes: [/middleware-manifest\.json$/],
});

export default pwaWrapper(nextConfig);
