import { fromTheme, type ThemeInput } from "@/lib/custom-theme";
import { getTheme, isThemeId } from "@/lib/themes";
import { builderOptions } from "../data";
import { ThemeBuilder } from "../ThemeBuilder";

export const dynamic = "force-dynamic";

const BLANK: ThemeInput = {
  name: "",
  description: "",
  tags: [],
  collection: "timeless",
  template: "fineline",
  heroArt: "peony-pink",
  palette: { bg: "#FAF7F0", surface: "#F1EBDF", text: "#25221D", muted: "#7A7368", accent: "#9A7B4F", onAccent: "#FFFFFF" },
  fonts: { display: "Cormorant Garamond", body: "Jost", script: "Great Vibes" },
  finish: "painted",
  reveal: "fade",
  ambient: "none",
  amount: "light",
};

export default async function NewTheme({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const opts = await builderOptions();
  const initial = from && isThemeId(from) ? fromTheme(getTheme(from)) : BLANK;
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-4xl">{from ? "Duplicate theme" : "New theme"}</h1>
      <ThemeBuilder initial={initial} {...opts} />
    </div>
  );
}
