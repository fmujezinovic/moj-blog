import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'kkcgmczjgcgvlkncharb.supabase.co', // Zamenjaj s pravim!
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // 🔥 PRAVILNO tukaj
    },
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // stub Node.js module references in the browser bundle
      config.resolve.fallback = {
        fs: false,
        module: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
