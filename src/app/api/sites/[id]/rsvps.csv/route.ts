import { getOwnedSite } from "@/lib/auth";
import { db } from "@/lib/db";

// Quote every cell and neutralise spreadsheet formulas (=, +, -, @).
function cell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await getOwnedSite(id);
  if (!site) return new Response("Not found", { status: 404 });
  const rsvps = await db.rsvp.findMany({ where: { siteId: site.id }, orderBy: { createdAt: "asc" } });
  const rows = [
    ["Name", "Email", "Attending", "Guests", "Meal", "Message", "Received"],
    ...rsvps.map((r) => [r.name, r.email, r.attending ? "Yes" : "No", r.guests, r.meal, r.message, r.createdAt.toISOString()]),
  ];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${site.slug}-rsvps.csv"`,
    },
  });
}
