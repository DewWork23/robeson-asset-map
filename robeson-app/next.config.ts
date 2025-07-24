import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/robeson-app' : '',
  images: {
    unoptimized: true
  },
  trailingSlash: true
};

export default nextConfig;
