import { readStored } from "@/lib/storage";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const joined = key.join("/");
  const ext = joined.split(".").pop() ?? "";
  if (!TYPES[ext] || key.length !== 2 || !/^[\w-]+\/[\w-]+\.\w+$/.test(joined)) return new Response("Not found", { status: 404 });
  const file = await readStored(joined).catch(() => null);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file.data as BodyInit, {
    headers: {
      "Content-Type": TYPES[ext],
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
