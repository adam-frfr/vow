import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getBool, getSetting } from "@/lib/settings";
import { Card, Empty, fmt, money, Stat } from "../parts";

export const dynamic = "force-dynamic";

export default async function AdminPayments() {
  const [payRes, enabled, key, amount, currency, premiumRes] = await Promise.all([
    supabase.from("Payment").select("*").order("createdAt", { ascending: false }).limit(200),
    getBool("pay.enabled"),
    getSetting("stripe.secretKey"),
    getSetting("pay.amount"),
    getSetting("pay.currency"),
    supabase.from("Site").select("*", { count: "exact", head: true }).eq("premium", true),
  ]);
  const payments = (payRes.data ?? []) as Array<{ id: string; siteId: string; userId: string; status: string; amount: number; currency: string; createdAt: string }>;
  const paid = payments.filter((p) => p.status === "paid");
  
  const siteIds = [...new Set(payments.map((p) => p.siteId))];
  const userIds = [...new Set(payments.map((p) => p.userId))];

  const [{ data: sites }, { data: users }] = await Promise.all([
    siteIds.length ? supabase.from("Site").select("id, slug").in("id", siteIds) : Promise.resolve({ data: [] }),
    userIds.length ? supabase.from("User").select("id, email").in("id", userIds) : Promise.resolve({ data: [] }),
  ]);

  const slug = new Map((sites ?? []).map((s: { id: string; slug: string }) => [s.id, s.slug]));
  const email = new Map((users ?? []).map((u: { id: string; email: string }) => [u.id, u.email]));
  const total = paid.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Payments</h1>
      {!enabled || !key ? (
        <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          Payments are {enabled ? "on, but no Stripe key is set" : "off"}: everything is free for everyone right now.{" "}
          <Link href="/admin/settings" className="underline">
            Set up payments
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
          Payments are on ({key.startsWith("sk_test") ? "Stripe test mode" : "Stripe live mode"}). Premium costs {money(Number(amount), currency)} per site.
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue" value={money(total, paid[0]?.currency ?? currency)} />
        <Stat label="Paid" value={paid.length} />
        <Stat label="Started, not paid" value={payments.filter((p) => p.status === "pending").length} />
        <Stat label="Premium sites" value={premiumRes.count ?? 0} />
      </div>
      <Card title="All payments">
        {payments.length === 0 ? (
          <Empty>No payments yet.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-stone">
                <tr>
                  <th className="py-2 pr-3 font-normal">When</th>
                  <th className="py-2 pr-3 font-normal">Site</th>
                  <th className="py-2 pr-3 font-normal">Customer</th>
                  <th className="py-2 pr-3 font-normal">Amount</th>
                  <th className="py-2 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 pr-3 text-xs">{fmt(new Date(p.createdAt))}</td>
                    <td className="py-2 pr-3 text-xs">/{slug.get(p.siteId) ?? "deleted"}</td>
                    <td className="py-2 pr-3 text-xs">{email.get(p.userId) ?? "deleted"}</td>
                    <td className="py-2 pr-3">{money(p.amount, p.currency)}</td>
                    <td className="py-2 text-xs">
                      <span className={`rounded-full px-2 py-0.5 ${p.status === "paid" ? "bg-emerald-100 text-emerald-900" : "bg-[#eee] text-stone"}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
