import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The offline helper must never be cached, so app updates reach phones on the next launch.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
  images: {
    domains: ["res.cloudinary.com"],
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "drive.google.com" },
      { hostname: "cdnb.artstation.com" },
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "source.boringavatars.com" },
      { hostname: "api.dicebear.com" },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      }
    ],
  }
};

export default nextConfig;
