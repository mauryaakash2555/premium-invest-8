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
    // Image optimization settings for faster loading
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react', 'framer-motion'],
  },
  // Reduce JavaScript bundle sizes
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
  // Disable all caching for blog routes but enable for static assets
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';

    return [
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
      {
        // Cache static assets for 1 year (production only)
        source: '/:path*.(ico|jpg|jpeg|png|gif|webp|avif|svg|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: isProd ? 'public, max-age=31536000, immutable' : 'no-store',
          },
        ],
      },
      {
        // Cache JS/CSS for 1 year (they're content-hashed) — but NEVER in dev.
        // In dev, some URLs are not content-hashed (or can change between rebuilds),
        // so "immutable" can cause stale client bundles and hydration mismatches.
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isProd ? 'public, max-age=31536000, immutable' : 'no-store',
          },
        ],
      },
    ];
  },

  // VS Code's Simple Browser/webviews can block eval(), which Next dev may use for source maps.
  // Use non-eval source maps in dev for the client bundle to avoid runtime crashes.
  webpack(config, { dev, isServer }) {
    if (dev && !isServer) {
      config.devtool = 'source-map';
    }
    return config;
  },

  async redirects() {
    return [
      {
        source: '/intelligence/sip-vs-panic-selling',
        destination: '/intelligence/sip-vs-panic',
        permanent: true,
      },
      {
        source: '/intelligence/sip-vs-panic-simulator',
        destination: '/intelligence/sip-vs-panic',
        permanent: true,
      },
      {
        source: '/intelligence/stop-sip-during-crash',
        destination: '/intelligence/sip-vs-panic',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
