// Builds supabase/setup.sql: every migration plus Prisma's migration history,
// so the file can be pasted into Supabase's SQL Editor and later deploys
// (`prisma migrate deploy`) see the tables as already created.
// Run: npm run supabase-sql
import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = "prisma/migrations";
const names = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

let out = `-- Vow database setup for Supabase.
-- Paste all of this into Supabase → SQL Editor → New query → Run.
-- Optional: the Vercel build creates the same tables automatically.
-- Safe to run only on an EMPTY database (a new project).

BEGIN;

CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                  VARCHAR(36) PRIMARY KEY NOT NULL,
    "checksum"            VARCHAR(64) NOT NULL,
    "finished_at"         TIMESTAMPTZ,
    "migration_name"      VARCHAR(255) NOT NULL,
    "logs"                TEXT,
    "rolled_back_at"      TIMESTAMPTZ,
    "started_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
`;

for (const name of names) {
  const sql = readFileSync(join(dir, name, "migration.sql"));
  const checksum = createHash("sha256").update(sql).digest("hex");
  out += `\n-- ── ${name} ──\n${sql.toString("utf8").trim()}\n`;
  out += `INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count") VALUES ('${randomUUID()}', '${checksum}', now(), '${name}', 1);\n`;
}

out += "\nCOMMIT;\n";
mkdirSync("supabase", { recursive: true });
writeFileSync("supabase/setup.sql", out);
console.log(`supabase/setup.sql: ${names.length} migrations`);
