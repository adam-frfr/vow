import "server-only";
import { parseContent } from "./content";
import { getBool, getSetting } from "./settings";

/** Whether the guest helper is available on this site (couple opted in, AI on, premium if required). */
export async function helperAvailable(site: { premium: boolean; content: string }) {
  if (!parseContent(site.content).ask.enabled) return false;
  if (!(await getBool("ai.enabled")) || !(await getSetting("groq.apiKey"))) return false;
  const premiumOnly = (await getBool("pay.enabled")) && (await getSetting("pay.features")).split(",").includes("guestHelper");
  return !premiumOnly || site.premium;
}
