import { PrismaClient } from "@prisma/client";

/**
 * Supabase's transaction pooler (port 6543) needs prepared statements off and a
 * single connection per serverless function; add those if the URL lacks them.
 */
function databaseUrl(raw = process.env.DATABASE_URL) {
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    if (u.hostname.endsWith("pooler.supabase.com") && u.port === "6543") {
      if (!u.searchParams.has("pgbouncer")) u.searchParams.set("pgbouncer", "true");
      if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "1");
    }
    return u.toString();
  } catch {
    return raw;
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: databaseUrl() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
