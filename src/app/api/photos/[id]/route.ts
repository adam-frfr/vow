import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseCustomization } from "@/lib/content";
import { deleteStored } from "@/lib/storage";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const photo = await db.photo.findFirst({ where: { id, site: { userId } }, include: { site: true } });
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.photo.delete({ where: { id: photo.id } });
  // If this photo was the cover, clear it.
  const cz = parseCustomization(photo.site.customization);
  if (cz.coverUrl === photo.url) {
    delete cz.coverUrl;
    await db.site.update({ where: { id: photo.siteId }, data: { customization: JSON.stringify(cz) } });
  }
  await deleteStored(photo.storageKey);
  return NextResponse.json({ ok: true });
}
