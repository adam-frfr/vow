import { getOwnedSite } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

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
  const { data: rawRsvps } = await supabase.from("Rsvp").select("*").eq("siteId", site.id).order("createdAt", { ascending: true });
  const rsvps = (rawRsvps as { name: string; email: string | null; attending: boolean; guests: number; meal: string | null; message: string | null; createdAt: string }[]) || [];
  const rows = [
    ["Name", "Email", "Attending", "Guests", "Meal", "Message", "Received"],
    ...rsvps.map((r) => [r.name, r.email, r.attending ? "Yes" : "No", r.guests, r.meal, r.message, new Date(r.createdAt).toISOString()]),
  ];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${site.slug}-rsvps.csv"`,
    },
  });
}
