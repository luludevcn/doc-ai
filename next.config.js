/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  api: {
    responseTimeout: 30_000,
  },
};

module.exports = nextConfig;