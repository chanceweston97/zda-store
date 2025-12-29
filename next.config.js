const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Add path aliases for webpack (required for production builds)
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    config.resolve.alias["@lib"] = path.resolve(__dirname, "src/lib");
    config.resolve.alias["@modules"] = path.resolve(__dirname, "src/modules");
    config.resolve.alias["@components"] = path.resolve(__dirname, "src/components");
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: '18.224.229.214',
        port: '9000',
      },
      {
        protocol: 'https',
        hostname: '18.224.229.214',
        port: '9000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      {
        protocol: 'https',
        hostname: 'admin.zdacomm.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'zdacomm.com',
        port: '',
      },
      {
        protocol: 'http',
        hostname: '18.191.243.236',
        port: '9000',
      },
    ],
  },
};

module.exports = nextConfig;
