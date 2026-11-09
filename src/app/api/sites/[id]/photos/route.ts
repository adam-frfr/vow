import { NextResponse } from "next/server";
import { getOwnedSite } from "@/lib/auth";
import { db } from "@/lib/db";
import { MAX_UPLOAD_BYTES, sniffImageType, storeFile } from "@/lib/storage";

const MAX_PHOTOS = 40;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await getOwnedSite(id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files received." }, { status: 400 });

  const count = await db.photo.count({ where: { siteId: site.id } });
  if (count + files.length > MAX_PHOTOS) {
    return NextResponse.json({ error: `You can upload up to ${MAX_PHOTOS} photos.` }, { status: 400 });
  }

  const created = [];
  for (const [i, file] of files.entries()) {
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: `${file.name} is larger than 10 MB.` }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const type = sniffImageType(bytes);
    if (!type) return NextResponse.json({ error: `${file.name} isn't a JPG, PNG or WebP image.` }, { status: 400 });
    const { key, url } = await storeFile(site.id, type, bytes);
    created.push(await db.photo.create({ data: { siteId: site.id, url, storageKey: key, position: count + i } }));
  }
  return NextResponse.json({ photos: created.map((p) => ({ id: p.id, url: p.url })) });
}
