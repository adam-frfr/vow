import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { dev }) {
    if (dev) {
      // The SQLite database and uploaded photos live in the project folder; writing them must
      // not trigger a recompile (a request racing a recompile can fail in dev).
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**", "**/prisma/*.db*", "**/uploads/**", "**/.claude/**"],
      };
    }
    return config;
  },
};

export default nextConfig;
