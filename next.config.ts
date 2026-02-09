import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Disable PWA in development to avoid caching issues
  disable: process.env.NODE_ENV === "development",
  // Use our custom service worker
  sw: "sw.js",
});

const nextConfig: NextConfig = {
  /* config options here */
  // Enable Turbopack with empty config to silence warning
  turbopack: {},
};

// @ts-expect-error - next-pwa types are slightly outdated for Next.js 16
export default withPWA(nextConfig);
