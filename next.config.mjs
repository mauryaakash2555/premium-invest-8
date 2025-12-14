/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Disable static generation for blog pages to ensure fresh content
  experimental: {
    // Force dynamic rendering
  },
};

export default nextConfig;
