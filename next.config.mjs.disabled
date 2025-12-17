/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Disable static generation for blog pages to ensure fresh content
  experimental: {
    // Force dynamic rendering
  },
  // Disable all caching for blog routes
  async headers() {
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
    ];
  },
};

export default nextConfig;
