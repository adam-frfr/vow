/**
 * Checks an uploaded Lottie animation (Bodymovin JSON). Rejects anything that
 * isn't one, and strips expressions (code snippets some files carry) even
 * though the player we use never runs them.
 */
export function checkLottie(bytes: Uint8Array): { ok: true; w: number; h: number; bytes: Uint8Array } | { ok: false; error: string } {
  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    if (bytes[0] === 0x50 && bytes[1] === 0x4b) return { ok: false, error: "That's a .lottie (zipped) file. Export it as Lottie JSON (.json) and upload that." };
    return { ok: false, error: "Upload a PNG or WebP image, or a Lottie animation (.json)." };
  }
  const a = data as { v?: unknown; w?: unknown; h?: unknown; fr?: unknown; ip?: unknown; op?: unknown; layers?: unknown };
  const isNum = (x: unknown) => typeof x === "number" && Number.isFinite(x);
  if (!a || typeof a !== "object" || typeof a.v !== "string" || !isNum(a.w) || !isNum(a.h) || !isNum(a.fr) || !Array.isArray(a.layers)) {
    return { ok: false, error: "That JSON isn't a Lottie animation (it needs v, w, h, fr and layers)." };
  }
  const w = Math.round(a.w as number);
  const h = Math.round(a.h as number);
  if (w < 1 || h < 1 || w > 8000 || h > 8000) return { ok: false, error: "The animation's size looks wrong." };
  stripExpressions(data);
  return { ok: true, w, h, bytes: new TextEncoder().encode(JSON.stringify(data)) };
}

/** Removes "x" (expression) strings anywhere in the tree. */
function stripExpressions(node: unknown, depth = 0) {
  if (depth > 60 || !node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const n of node) stripExpressions(n, depth + 1);
    return;
  }
  const o = node as Record<string, unknown>;
  if (typeof o.x === "string") delete o.x;
  for (const v of Object.values(o)) stripExpressions(v, depth + 1);
}
