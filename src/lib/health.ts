import "server-only";
import { db } from "./db";

/**
 * Plain-English setup problems (no secrets): used by /api/health and by
 * sign-up/log-in when something fails, so a bad deploy says what to fix.
 */
export async function setupProblems(): Promise<string[]> {
  const out: string[] = [];
  const secret = process.env.AUTH_SECRET ?? "";
  if (!secret) out.push("AUTH_SECRET is not set in Vercel → Settings → Environment Variables (then redeploy).");
  else if (secret.length < 32) out.push(`AUTH_SECRET is only ${secret.length} characters; it must be at least 32. Generate one with the command in DEPLOY.md, save it in Vercel, then redeploy.`);

  const url = process.env.DATABASE_URL ?? "";
  if (!url) {
    out.push("DATABASE_URL is not set in Vercel → Settings → Environment Variables (then redeploy).");
    return out;
  }
  const problem = await databaseProblem();
  if (problem) out.push(problem);
  return out;
}

export async function databaseProblem(): Promise<string | null> {
  try {
    await db.user.count();
    return null;
  } catch (e) {
    return explainDbError(e);
  }
}

export function explainDbError(e: unknown): string {
  const err = e as { errorCode?: string; code?: string; message?: string };
  const code = err.errorCode ?? err.code ?? "";
  const msg = String(err.message ?? "");
  if (code === "P1000" || /authentication failed|password authentication/i.test(msg))
    return "The database refused the password in DATABASE_URL. In Supabase, reset the database password, copy the Prisma URL again, update it in Vercel and redeploy.";
  if (code === "P1001" || /can't reach database|ENOTFOUND|ECONNREFUSED|timed out/i.test(msg))
    return "The site can't reach the database. Use Supabase's pooled address (…pooler.supabase.com:6543) from Project → Connect → ORMs → Prisma, not db.xxx.supabase.co.";
  if (code === "P1013" || /invalid.*(url|connection string)|invalid port|must start with the protocol|error parsing connection string/i.test(msg))
    return "DATABASE_URL isn't a valid connection string. Copy it again from Supabase; if the password has symbols like @ # / ?, reset it to letters and numbers only.";
  if (code === "P2021" || /does not exist in the current database|relation .* does not exist/i.test(msg))
    return "The database tables haven't been created yet. Redeploy on Vercel (the build creates them), or paste supabase/setup.sql into Supabase's SQL Editor.";
  if (/prepared statement/i.test(msg)) return "DATABASE_URL needs ?pgbouncer=true at the end (Supabase's pooler). Add it in Vercel and redeploy.";
  if (/Tenant or user not found/i.test(msg)) return "Supabase didn't recognise the user in DATABASE_URL. Copy the Prisma URL again from Project → Connect (the user looks like postgres.<project-id>).";
  return "The database returned an error. Open /api/health on your site for details, and check Vercel → Deployments → Logs.";
}

/** Problem with AUTH_SECRET (checked before anything is written), or null. */
export function authSecretProblem(): string | null {
  const s = process.env.AUTH_SECRET ?? "";
  if (!s) return "AUTH_SECRET is not set in Vercel → Settings → Environment Variables (then redeploy).";
  if (s.length < 32) return `AUTH_SECRET is only ${s.length} characters; it must be at least 32 (see DEPLOY.md), then redeploy.`;
  return null;
}

/** Turns a crash in sign-up/log-in into a message that says what to fix. */
export function withSetupErrors(fn: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await fn(req);
    } catch (e) {
      console.error("[auth] request failed:", e);
      const problems = await setupProblems().catch(() => [] as string[]);
      const why = problems[0] ?? explainDbError(e);
      return Response.json({ error: `The site isn't set up correctly yet. ${why}` }, { status: 500 });
    }
  };
}
