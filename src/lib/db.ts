import { PrismaClient } from "@prisma/client";

/**
 * Supabase's transaction pooler (port 6543) needs prepared statements off.
 * Pages run several queries at once, so each serverless function gets a few
 * connections (the pooler multiplexes them) and a generous wait, instead of
 * one connection that queues every query and times out (P2024).
 */
function databaseUrl(raw = process.env.DATABASE_URL || "postgresql://postgres.rzltilisyyfpraalscjx:JBhl61olMP6bgnku@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true") {
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    if (u.hostname.endsWith("pooler.supabase.com") && u.port === "6543") {
      u.searchParams.set("pgbouncer", "true");
      const limit = Number(u.searchParams.get("connection_limit") ?? 0);
      if (!limit || limit < 5) u.searchParams.set("connection_limit", "5");
      if (!u.searchParams.has("pool_timeout")) u.searchParams.set("pool_timeout", "30");
    }
    return u.toString();
  } catch {
    return raw;
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: databaseUrl() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
