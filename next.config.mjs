import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
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
    ],
    // Performance: prefer WebP, optimize device sizes
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Performance: tree-shake heavy packages
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    // optimizeCss: true, // Disabled: requires stable critters integration
  },
  // Performance: remove console in production
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'], // Keep error/warn for debugging
    },
  },
  // Caching headers
  async headers() {
    return [
      // Disable caching for blog routes (fresh content)
      {
        source: '/blog/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
      // Long-term caching for static assets (1 year, immutable)
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|woff|woff2|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Webpack performance optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.usedExports = true;
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
