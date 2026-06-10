/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable API routes for database functionality
  // Note: This requires a Node.js server for deployment (Vercel, Railway, etc.)
  // distDir: './dist', // Using default .next directory
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Handle environment variables from the Vite config
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  // Turbopack disabled - using webpack instead due to Windows compatibility
  turbopack: {},
  // Path aliases to match the Vite config (for webpack fallback)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': process.cwd(),
    }
    return config
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/admin/login',
        permanent: true,
      },
    ]
  },
}

export default nextConfig