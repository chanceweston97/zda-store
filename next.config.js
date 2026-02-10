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
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    config.resolve.alias["@lib"] = path.resolve(__dirname, "src/lib");
    config.resolve.alias["@modules"] = path.resolve(__dirname, "src/modules");
    config.resolve.alias["@components"] = path.resolve(__dirname, "src/components");
    return config;
  },

  async redirects() {
    return [
      {
        source: "/admin",
        destination: "https://admin.zdacomm.com/wp-admin",
        permanent: false,
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "localhost", port: "9000" },
      { protocol: "https", hostname: "admin.zdacomm.com" },
      { protocol: "https", hostname: "cms.zdacomm.com" },
      { protocol: "https", hostname: "zdacomm.com" },
    ],
  },
};

module.exports = nextConfig;
