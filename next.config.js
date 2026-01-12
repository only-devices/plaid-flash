/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Suppress async params warnings for pages that don't use them
    missingSuspenseWithCSRBailout: false,
  },
  // Exclude ngrok from webpack bundling (native binary)
  serverExternalPackages: ['@ngrok/ngrok'],
}

module.exports = nextConfig

