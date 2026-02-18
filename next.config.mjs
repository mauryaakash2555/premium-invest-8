import path from 'path';
import { fileURLToPath } from 'url';
import bundleAnalyzer from '@next/bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip compression for all responses (reduces transfer size ~60-70%).
  compress: true,
  // Remove the X-Powered-By: Next.js header (security + slightly smaller responses).
  poweredByHeader: false,
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
  // SEO: Permanent redirects to consolidate duplicate/legacy URLs.
  // These fire at the Next.js routing layer (before middleware) and send 308 Permanent Redirect.
  // The middleware also handles these, but having them here gives Vercel Edge an extra-fast path.
  async redirects() {
    return [
      // Canonical domain: non-www → www (catches any requests that bypass Cloudflare/middleware)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'bmwealth.co.in' }],
        destination: 'https://www.bmwealth.co.in/:path*',
        permanent: true,
      },
      // Legacy path redirects (also in middleware, duplicated here for Vercel edge performance)
      { source: '/about', destination: '/about-us', permanent: true },
      { source: '/terms', destination: '/terms-and-conditions', permanent: true },
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/refund-policy', destination: '/refund', permanent: true },
      { source: '/live', destination: '/live-intelligence', permanent: true },
      { source: '/live-intel', destination: '/live-intelligence', permanent: true },
      { source: '/sitemap-page', destination: '/sitemap', permanent: true },
    ];
  },
  // Disable all caching for blog routes but enable for static assets
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';

    return [
      {
        // Videos under /public/videos are likely to be updated/replaced.
        // Do NOT cache them as immutable for a year, otherwise browsers/CDNs
        // can keep serving the old video even after you upload a new one.
        source: '/videos/:path*.(mp4|webm)',
        headers: [
          {
            key: 'Cache-Control',
            value: isProd
              ? 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
              : 'no-store',
          },
        ],
      },
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
        source: '/:path*.(mp3|pdf)',
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
  
  // PDF.js worker configuration for serverless
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias['canvas'] = false;
      config.resolve.alias['encoding'] = false;
    }
    
    // PDF.js worker alias
    config.resolve.alias['pdfjs-dist/build/pdf.worker.js'] = 
      'pdfjs-dist/legacy/build/pdf.worker.js';
    
    return config;
  },
};

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
export default withBundleAnalyzer(nextConfig);
