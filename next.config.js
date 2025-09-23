/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix the lockfile warning
  outputFileTracingRoot: process.cwd(),
  
  // Fix deprecated experimental option
  serverExternalPackages: [],
  
  // Fix TypeScript issues
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Enable proper routing
  trailingSlash: false,
  
  // Fix build issues
  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default nextConfig
