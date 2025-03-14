/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.larvalabs.com',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/ipfs/**',
      },
    ],
  },
  typescript: {
    // !! WARN !!
    // Ignoring type checking during build
    // This is not recommended unless you're in a hurry
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  env: {
    // Make environment variables available to the frontend
    NEXT_PUBLIC_MORALIS_API: process.env.MORALIS_API,
    NEXT_PUBLIC_RESERVOIR_API: process.env.RESERVOIR_API,
  },
}

export default nextConfig
