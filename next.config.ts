import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    USE_MOCK_API: process.env.USE_MOCK_API || 'false',
  },
};

export default nextConfig;
