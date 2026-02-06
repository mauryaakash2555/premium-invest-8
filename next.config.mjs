import path from 'path';
import { fileURLToPath } from 'url';
import bundleAnalyzer from '@next/bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // pdf-parse (v2+) pulls in pdfjs-dist (and in some setups native canvas).
  // Keeping these as server externals avoids webpack/RSC bundling issues with pdfjs .mjs.
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas'],
  // Prevent Next from inferring a wrong monorepo/workspace root when multiple lockfiles exist.
  outputFileTracingRoot: __dirname,
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
    // Explicitly allow the qualities we use across the site.
    // Next.js 16 will require any non-default `quality` values to be listed here.
    qualities: [60, 75, 90],
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
            // Blog pages are safe to CDN-cache; use SWR in prod.
            value: isProd
              ? 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
              : 'no-store',
          },
          {
            key: 'CDN-Cache-Control',
            value: isProd ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'no-store',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: isProd ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'no-store',
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
        // Cache heavier media/docs for 1 year (production only)
        source: '/:path*.(mp4|webm|mp3|pdf)',
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

  // NOTE: Do not override webpack devtool in dev.
  // Next.js warns and may revert it, causing noisy logs and unstable perf.
};

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
export default withBundleAnalyzer(nextConfig);
