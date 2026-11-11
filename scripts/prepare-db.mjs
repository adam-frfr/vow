// Runs before `next build` (see package.json): checks the environment values,
// fills in DIRECT_URL when it can, then creates/updates the database tables.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

// Local builds read .env (Vercel passes its Environment Variables directly).
if (existsSync(".env")) {
  for (const m of readFileSync(".env", "utf8").matchAll(/^([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\r\n]*)"?/gm)) {
    if (!process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const val = (k) => process.env[k]?.trim() || "";
const problems = [];
const db = val("DATABASE_URL");
if (!db) problems.push("DATABASE_URL is missing. In Supabase: Project → Connect → ORMs → Prisma, copy the pooled URL (port 6543).");
if (val("AUTH_SECRET") && val("AUTH_SECRET").length < 32) problems.push(`AUTH_SECRET is only ${val("AUTH_SECRET").length} characters; it must be at least 32. Generate one with the command in DEPLOY.md.`);
if (!val("AUTH_SECRET")) problems.push('AUTH_SECRET is missing. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"');

let host = "";
try {
  host = db ? new URL(db).hostname : "";
} catch {
  problems.push("DATABASE_URL isn't a valid URL. Copy it again from Supabase (and make sure the password has no unescaped @ or # characters).");
}
if (/^db\.[a-z0-9]+\.supabase\.co$/.test(host)) {
  problems.push(
    "DATABASE_URL uses Supabase's direct address (db.xxx.supabase.co), which Vercel can't reach (it is IPv6-only). Use the pooled address from Project → Connect → ORMs → Prisma (…pooler.supabase.com:6543).",
  );
}

if (problems.length) {
  console.error("\n✖ Vow can't build yet. In Vercel → Project → Settings → Environment Variables:\n");
  for (const p of problems) console.error(`  • ${p}`);
  console.error("\nThen redeploy (Deployments → ⋯ → Redeploy). See DEPLOY.md.\n");
  process.exit(1);
}

/** Supabase's session pooler (port 5432) from its transaction pooler URL (port 6543). */
function deriveDirect(url) {
  const u = new URL(url);
  if (u.hostname.endsWith("pooler.supabase.com") && u.port === "6543") u.port = "5432";
  u.searchParams.delete("pgbouncer");
  u.searchParams.delete("connection_limit");
  return u.toString();
}

let direct = val("DIRECT_URL");
if (!direct) {
  direct = deriveDirect(db);
  console.log("ℹ DIRECT_URL not set: using the session pooler worked out from DATABASE_URL for migrations.");
}

// If DATABASE_URL or DIRECT_URL is set, attempt migrations, but don't fail the entire build
// if the tables were already created via SQL Editor.
const r = spawnSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit", env: { ...process.env, DIRECT_URL: direct }, shell: process.platform === "win32" });
if (r.status !== 0) {
  console.warn("⚠️ Warning: prisma migrate deploy exited with code " + r.status + ". Proceeding with build since tables may already be provisioned.");
}
process.exit(0);
