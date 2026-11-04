import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Client portal messages can carry files (up to 4 MB in total; Vercel accepts at most 4.5 MB per request).
    serverActions: { bodySizeLimit: "4.5mb" },
  },
};

export default nextConfig;
