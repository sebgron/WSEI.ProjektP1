import type { NextConfig } from "next";

console.log("Next Config Loaded: Disabling Indicators");

const nextConfig: NextConfig = {
  transpilePackages: ["@turborepo/shared"],
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;
