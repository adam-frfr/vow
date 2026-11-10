import type { NextConfig } from "next";

/** The built-in art library lives in /assets and is served by route handlers (B2 first, this copy as fallback). */
const art = (root: string) => [`./assets/${root}/**/*`];

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/library/[...path]": art("library"),
    "/florals/[...path]": art("florals"),
    "/fx/[...path]": art("fx"),
    "/cutouts/[...path]": art("cutouts"),
    "/api/admin/storage/sync": ["./assets/**/*"],
  },
  webpack(config, { dev }) {
    if (dev) {
      // Uploaded files and local tooling must not trigger a recompile mid-request.
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**", "**/prisma/*.db*", "**/uploads/**", "**/.claude/**", "**/assets/**"],
      };
    }
    return config;
  },
};

export default nextConfig;
