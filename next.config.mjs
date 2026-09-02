/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { optimizePackageImports: ['firebase'] }
};
export default nextConfig;
