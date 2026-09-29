import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA configuration for offline support
  compress: true,

  // Headers for PWA and offline support
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/:path((?!api).*)*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/offline.html",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },

  // Rewrites for offline fallback
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/offline",
          destination: "/offline.html",
        },
      ],
    };
  },

  // Other existing config
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
