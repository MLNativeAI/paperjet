/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@paperjet/ui"],
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  images: {
    unoptimized: true,
  },
  // output: 'standalone',
}

export default nextConfig
