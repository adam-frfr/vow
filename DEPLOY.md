# Deploying Vow (free: Vercel + Supabase + Backblaze B2)

Everything after this one-time setup is controlled from **/admin**.

| Piece | Service | Free plan |
|---|---|---|
| Website | Vercel Hobby | Free while you're not charging. Upgrade to Pro ($20/mo) before turning payments on. |
| Database | Supabase | 500 MB. Pauses after 7 idle days; the daily keep-alive job (vercel.json) prevents that. |
| Art library + photos | Backblaze B2 | 10 GB. Vercel's CDN caches every file, so B2 downloads stay tiny. |

## 1. Supabase (database)
1. supabase.com → New project. Save the database password.
2. Project → **Connect** → ORMs → **Prisma**. Copy the two URLs:
   - `DATABASE_URL` (port **6543**). The site adds `pgbouncer=true`, `connection_limit=5` and `pool_timeout=30` itself, so the URL can be pasted as is.
   - `DIRECT_URL` (port **5432**, the session pooler).
3. Tables: nothing to do, because the Vercel build creates them. If you'd rather see them first, paste
   [`supabase/setup.sql`](supabase/setup.sql) into Supabase → **SQL Editor** → New query → **Run** (new, empty project only).
   It also records itself in Prisma's migration history, so later deploys won't try to create the tables again.
   After changing `prisma/schema.prisma` and adding a migration, regenerate it with `npm run supabase-sql`.

## 2. Vercel (website)
1. vercel.com → Add New → Project → import the `vow` GitHub repo. Framework: Next.js (detected).
2. Environment Variables (all environments):
   - `DATABASE_URL`, `DIRECT_URL` from step 1
   - `AUTH_SECRET`: generate with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Never change it later: it encrypts the keys saved in /admin.
3. Deploy. The build creates the database tables automatically (`prisma migrate deploy`).
4. **Speed tip:** Vercel → Settings → **Functions** → Function Region: pick the region closest to your Supabase project. The region is in your `DATABASE_URL` host, e.g. `aws-0-ap-south-1` = Mumbai, `aws-0-us-east-1` = Washington, `aws-0-eu-central-1` = Frankfurt. Every page talks to the database several times, so being in the same region makes pages much faster.

## 3. Claim the admin account
Open your site and **sign up first**. The first account on a fresh database becomes the admin. Do this right after the first deploy.

## 4. Everything else, in /admin → Settings
- **Backblaze B2**: create a bucket (Private is fine), then App Keys → Add a New Application Key with read/write on that bucket. Paste the S3 endpoint, bucket, key ID and key → Save → **Test connection** → **Copy built-in library to Backblaze** (a few minutes; keep the tab open).
  Until B2 is connected, photos are stored in the database and art is served from the copy built into the site, so nothing is broken in the meantime.
- **Groq**: paste the API key → Test → Save.
- **Stripe** (only after upgrading Vercel to Pro): paste the secret key → Save. The webhook is created and its secret saved automatically. Then switch **Payments on**.
- **Maintenance mode**: pauses the site for everyone but admins.

## Controlled from /admin
- **Themes & designs**: create themes in the theme builder (live preview, drafts, publish/unpublish, duplicate any theme, delete unused ones); hide or show any theme or design; lock themes and designs as Premium-only.
- **Collections**: create, rename, describe, reorder, hide and delete collections; move any theme into any collection.
- **Art library**: create your own sections (tabs in every couple's library), upload images (PNG/WebP) or Lottie animations (JSON) into them, move, hide, lock as Premium or delete them.
- Users, sites, spam and abuse, payments and Premium pricing, AI (Groq), storage (Backblaze), maintenance mode, sign-ups, the dashboard announcement.

Premium locks only apply while payments are on; with payments off everything stays free. Hidden or locked things keep working for sites that already use them.

## Still needs code (by design)
Brand-new **site designs** (page layouts such as Passport or Vinyl) and brand-new **features**. Everything else above is data the admin panel manages.

## Not in /admin (by design)
`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`: the site needs them to reach its own settings, and `AUTH_SECRET` is the key that encrypts the others.
