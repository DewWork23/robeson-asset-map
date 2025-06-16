import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NODE_ENV === 'production' ? '/robeson-asset-map' : '',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
