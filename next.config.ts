import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "drive.google.com" },
      { hostname: "cdnb.artstation.com" },
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "res.cloudinary.com" },
    ],
  }
};

export default nextConfig;
