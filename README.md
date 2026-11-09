# Vow: wedding invitation websites

Couples pick a designer theme, write their own words, upload photos, publish to
their own link (`/sara-and-adam`) and collect RSVPs.

## Features
- **32 themes in 8 collections**: Timeless Elegance, Romantic Garden, Sweet & Playful,
  Rustic & Boho, Modern Minimal, Destination, Vintage & Royal, Seasonal.
  Five hero layouts (full-bleed photo, editorial split, arch portrait, antique
  botanical plate, polaroid snapshots). All built on real imagery: no CSS-drawn decoration.
- **Editor** with live desktop/mobile preview and autosave: switch themes, override
  colours and fonts, edit every section, reorder/rename/hide sections, choose a cover photo.
- **Photo uploads** (JPG/PNG/WebP, magic-byte checked, 10 MB, 40 per site).
- **RSVP** with guest count, meal choice and notes; guest dashboard with totals and CSV export.
- Accounts (bcrypt + signed JWT cookie), drafts private until published, rate limiting on auth/RSVP.

## Run locally
```bash
npm install
cp .env.example .env   # then set AUTH_SECRET (command in the file)
npx prisma migrate dev
npm run dev
```

## Where things live
| What | File |
|---|---|
| Theme catalogue (add a theme here) | `src/lib/themes.ts` |
| Editable content model + defaults | `src/lib/content.ts` |
| The guest-facing site renderer | `src/components/invite/InviteSite.tsx`, `invite.css` |
| Editor | `src/app/dashboard/sites/[id]/Editor.tsx` |
| Upload storage driver | `src/lib/storage.ts` |

## Going to production
1. **Database:** change `provider` in `prisma/schema.prisma` to `postgresql`, point
   `DATABASE_URL` at Postgres (Supabase/Neon), run `npx prisma migrate deploy`.
2. **Uploads:** `src/lib/storage.ts` writes to local disk. On Vercel/serverless, swap
   its three functions for S3 / Cloudflare R2 / Supabase Storage.
3. **Rate limiting** is in-memory (`src/lib/rate-limit.ts`). Use Upstash/Redis with multiple instances.
4. Theme images are hot-linked from Unsplash (Unsplash License) and Wikimedia
   Commons (public-domain Redouté plates). Consider self-hosting them before launch.

## Credits
Photography via [Unsplash](https://unsplash.com/license). Botanical plates by
Pierre-Joseph Redouté, *Les Roses* (1817–1824), public domain.
