/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseTimeout: 30000,
  },
};

module.exports = nextConfig;