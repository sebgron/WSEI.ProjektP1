import type { NextConfig } from "next";



const nextConfig: NextConfig = {
  transpilePackages: ["@turborepo/shared"],
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;
