const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000'
      },
    ],
  },
  serverExternalPackages: ['mongoose', 'bcryptjs', 'speakeasy', 'qrcode', '@react-pdf/renderer'],
}

module.exports = withNextIntl(nextConfig)
