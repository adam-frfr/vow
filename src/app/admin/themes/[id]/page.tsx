import { notFound } from "next/navigation";
import { themeInputSchema } from "@/lib/custom-theme";
import { supabase } from "@/lib/supabase";
import { builderOptions } from "../data";
import { ThemeBuilder } from "../ThemeBuilder";

export const dynamic = "force-dynamic";

export default async function EditTheme({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ data: row }, { count: sitesCount }] = await Promise.all([
    supabase.from("CustomTheme").select("*").eq("id", id).maybeSingle(),
    supabase.from("Site").select("*", { count: "exact", head: true }).eq("themeId", id),
  ]);
  if (!row) notFound();
  let raw: unknown = {};
  try {
    raw = JSON.parse(row.data);
  } catch {}
  const parsed = themeInputSchema.safeParse(raw);
  if (!parsed.success) notFound();
  const opts = await builderOptions();
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-4xl">Edit “{row.name}”</h1>
      <ThemeBuilder initial={parsed.data} id={id} status={row.status as "draft" | "published"} sites={sitesCount ?? 0} {...opts} />
    </div>
  );
}
