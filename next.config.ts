import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/donate",
        destination: "/get-involved",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
