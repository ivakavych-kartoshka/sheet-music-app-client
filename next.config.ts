import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cấu hình cho mobile và performance
  experimental: {
    optimizeCss: true,
  },
  
  // Cấu hình images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Cấu hình headers cho mobile
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Cấu hình rewrites cho API
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!backendUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  
  // Cấu hình power cho mobile
  poweredByHeader: false,
  
  // Cấu hình compress
  compress: true,
  
  // Cấu hình static generation
  generateEtags: false,
};

export default nextConfig;
