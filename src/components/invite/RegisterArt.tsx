"use client";

import { registerArt, type Floral } from "@/lib/assets";

/** Makes admin-uploaded art known in the browser before the stickers and decor render. */
export function RegisterArt({ art }: { art?: Floral[] }) {
  registerArt(art);
  return null;
}
