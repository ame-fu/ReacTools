import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/file-to-base64",
        destination: "/base64-string-converter",
        permanent: true,
      },
      {
        source: "/base64-converter",
        destination: "/base64-string-converter",
        permanent: true,
      },
      {
        source: "/color-picker-converter",
        destination: "/color-converter",
        permanent: true,
      },
      {
        source: "/text-stats",
        destination: "/text-statistics",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
