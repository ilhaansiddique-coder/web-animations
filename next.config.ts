import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A lockfile in the home directory otherwise wins root inference.
  turbopack: { root: __dirname },
};

export default nextConfig;
