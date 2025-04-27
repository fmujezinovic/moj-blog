import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "kkcgmczjgcgvlkncharb.supabase.co", // Zamenjaj s pravim!
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // 🔥 PRAVILNO tukaj
    },
  },
};

export default nextConfig;
