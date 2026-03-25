import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/studio",
        destination: "/design-system",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
