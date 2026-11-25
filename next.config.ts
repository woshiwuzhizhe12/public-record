import type { NextConfig } from "next";

// GitHub Pages publishes the project site under /public-record.
// Leave this unset for local `next dev` / `next build` so the app stays at /.
const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? "/public-record" : "";

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(pages
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: basePath,
        // Emit /about/index.html so Pages can serve the route without a Next server.
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
