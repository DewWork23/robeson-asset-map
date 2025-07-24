import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/robeson-app',
  assetPrefix: '/robeson-app',
  images: {
    unoptimized: true
  },
  trailingSlash: true
};

export default nextConfig;
