import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { parseContent } from "@/lib/content";
import { db } from "@/lib/db";
import { guard } from "@/lib/security";
import { createCheckout, payConfig } from "@/lib/stripe";

/** Start a Stripe Checkout for this site's one-time Premium upgrade. */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!(await guard(req, "checkout", 10, 60_000))) return NextResponse.json({ error: "Please wait a moment." }, { status: 429 });
  const p = z.object({ siteId: z.string() }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const site = await db.site.findFirst({ where: { id: p.data.siteId, userId: user.id } });
  if (!site) return NextResponse.json({ error: "Site not found." }, { status: 404 });
  if (site.premium) return NextResponse.json({ error: "This site is already Premium." }, { status: 400 });
  if (!(await payConfig()).live) return NextResponse.json({ error: "Upgrades aren't available right now." }, { status: 503 });
  const c = parseContent(site.content);
  try {
    const url = await createCheckout({
      siteId: site.id,
      userId: user.id,
      email: user.email,
      names: `${c.partner1} & ${c.partner2}`,
      origin: new URL(req.url).origin,
    });
    return NextResponse.json({ url });
  } catch (e) {
    console.error("Checkout failed", e);
    return NextResponse.json({ error: "Couldn't start the payment. Please try again." }, { status: 502 });
  }
}
