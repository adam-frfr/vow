import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import { markPaid, verifyStripeSignature } from "@/lib/stripe";

/** Stripe webhook: checkout.session.completed → the site becomes Premium. */
export async function POST(req: Request) {
  const payload = await req.text();
  const secret = await getSetting("stripe.webhookSecret");
  if (!verifyStripeSignature(payload, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  const event = JSON.parse(payload) as { type?: string; data?: { object?: { id?: string; payment_status?: string; metadata?: { siteId?: string } } } };
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const s = event.data?.object;
    if (s?.id) await markPaid(s.id, s);
  }
  return NextResponse.json({ received: true });
}
