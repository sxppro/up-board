/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{
       protocol: 'https',
        hostname: 'app.up.com.au',
        pathname: '/asset/**',
    }]
  }
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
