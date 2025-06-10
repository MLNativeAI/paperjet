/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@docwrench/ui"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
