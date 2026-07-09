import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@cursor/sdk", "@fal-ai/client"],
};

export default nextConfig;
