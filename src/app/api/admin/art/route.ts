import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { forgetCatalog } from "@/lib/catalog";
import { db } from "@/lib/db";
import { imageSize } from "@/lib/image-size";
import { checkLottie } from "@/lib/lottie";
import { MAX_UPLOAD_BYTES, putObject, sniffImageType } from "@/lib/storage";

const KINDS = ["bouquet", "frame", "wreath", "corner", "border", "garland", "elements", "pattern", "texture"] as const;
const FAMS = ["pink", "red", "purple", "blue", "green", "yellow", "neutral"] as const;

const meta = z.object({
  name: z.string().trim().min(1).max(60),
  kind: z.enum(KINDS),
  tone: z.enum(["any", "light"]),
  fam: z.array(z.enum(FAMS)).max(4),
  section: z.string().max(40).optional(),
});

/**
 * Adds an image (PNG/WebP) or a Lottie animation (JSON) to the library, either
 * under a built-in kind or in a section the admin created. Stored on B2, or in
 * the database until B2 is set up.
 */
export async function POST(req: Request) {
  return withAdmin(async () => {
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!form || !(file instanceof File)) return NextResponse.json({ error: "Choose a file." }, { status: 400 });
    const m = meta.safeParse({
      name: form.get("name"),
      kind: form.get("kind") || "elements",
      tone: form.get("tone") || "any",
      fam: String(form.get("fam") ?? "").split(",").filter(Boolean),
      section: form.get("section") || undefined,
    });
    if (!m.success) return NextResponse.json({ error: m.error.issues[0]?.message ?? "Check the details." }, { status: 400 });
    if (m.data.section && !(await db.librarySection.findUnique({ where: { id: m.data.section } }))) {
      return NextResponse.json({ error: "That section no longer exists." }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Files must be under 4 MB." }, { status: 400 });
    const bytes = new Uint8Array(await file.arrayBuffer());

    const slug = m.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 36) || "art";
    const id = `c-${slug}-${randomBytes(3).toString("hex")}`;

    const type = sniffImageType(bytes);
    if (type === "image/png" || type === "image/webp") {
      const size = imageSize(bytes);
      if (!size || size.w < 40 || size.h < 40) return NextResponse.json({ error: "Couldn't read the image size." }, { status: 400 });
      await putObject(`assets/library/${id}.webp`, type, bytes);
      await db.artAsset.create({
        data: { id, name: m.data.name, kind: m.data.kind, tone: m.data.tone, fam: m.data.fam.join(","), w: size.w, h: size.h, section: m.data.section, format: "image" },
      });
    } else {
      const lottie = checkLottie(bytes);
      if (!lottie.ok) return NextResponse.json({ error: lottie.error }, { status: 400 });
      if (!m.data.section) return NextResponse.json({ error: "Animations go into one of your sections. Create one (e.g. “Animations”) first." }, { status: 400 });
      await putObject(`assets/library/${id}.json`, "application/json", lottie.bytes);
      await db.artAsset.create({
        data: { id, name: m.data.name, kind: "animation", tone: "any", fam: m.data.fam.join(","), w: lottie.w, h: lottie.h, section: m.data.section, format: "lottie" },
      });
    }
    forgetCatalog();
    return NextResponse.json({ id });
  });
}
