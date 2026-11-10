import { ALL_FLORALS } from "@/lib/assets";
import { getCatalog } from "@/lib/catalog";
import { b2 } from "@/lib/storage";
import { LibraryAdmin } from "./LibraryAdmin";

export const dynamic = "force-dynamic";

export default async function AdminLibrary() {
  const cat = await getCatalog();
  const art = [...cat.art, ...ALL_FLORALS.filter((a) => !a.custom)];
  const onB2 = !!(await b2());
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Art library</h1>
        <p className="mt-1 max-w-2xl text-sm text-stone">
          {art.length} pieces · {cat.hiddenArt.length} hidden · {cat.art.length} uploaded by you · {cat.sections.length} section{cat.sections.length === 1 ? "" : "s"} of your own.
          Hidden art disappears from every picker; sites already using it keep it. Uploads are stored{" "}
          {onB2 ? "on Backblaze B2" : "in the database until you connect Backblaze B2 under Settings"}.
        </p>
      </div>
      <LibraryAdmin art={art} hidden={cat.hiddenArt} sections={cat.sections} payLive={cat.payLive} />
    </div>
  );
}
