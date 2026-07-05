import type { NextConfig } from "next";

/** 部署子路径，如 https://www.perlafu.com/mytools/；本地开发可设 BASE_PATH= 关闭 */
const basePath = process.env.BASE_PATH ?? "/mytools";

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  turbopack: {
    root: process.cwd(),
  },
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
