import type { CSSProperties } from "react";
import "./invite.css";
import { initials, type Customization, type InviteContent } from "@/lib/content";
import { getTheme, googleFontsHref, img, SAMPLE_GALLERY, templateOf, type TemplateId } from "@/lib/themes";
import { buildCtx, type Ctx, type Mode, type Wish } from "./ctx";
import { Intro } from "./Intro";
import { Botanical } from "./templates/Botanical";
import { Cinematic } from "./templates/Cinematic";
import { Classic } from "./templates/Classic";
import { Editorial } from "./templates/Editorial";
import { Gallery } from "./templates/Gallery";
import { Gazette } from "./templates/Gazette";
import { Grand } from "./templates/Grand";
import { Letter } from "./templates/Letter";
import { Pop } from "./templates/Pop";
import { Scrapbook } from "./templates/Scrapbook";
import { Split } from "./templates/Split";
import { Stationery } from "./templates/Stationery";
import { Storybook } from "./templates/Storybook";
import { Swiss } from "./templates/Swiss";
import { Voyage } from "./templates/Voyage";

const TEMPLATES: Record<TemplateId, (p: { ctx: Ctx }) => React.ReactNode> = {
  classic: Classic,
  grand: Grand,
  editorial: Editorial,
  gazette: Gazette,
  gallery: Gallery,
  cinematic: Cinematic,
  voyage: Voyage,
  stationery: Stationery,
  storybook: Storybook,
  scrapbook: Scrapbook,
  pop: Pop,
  swiss: Swiss,
  split: Split,
  botanical: Botanical,
  letter: Letter,
};

export interface InviteSiteProps {
  themeId: string;
  content: InviteContent;
  customization?: Customization;
  photos?: string[];
  wishes?: Wish[];
  /** live = published site, preview = editor, demo = theme showcase */
  mode: Mode;
  slug?: string;
  /** Force a template (theme gallery "try this layout"). */
  template?: TemplateId;
}

export function InviteSite({ themeId, content, customization: cz = {}, photos = [], wishes = [], mode, slug, template }: InviteSiteProps) {
  const theme = getTheme(themeId);
  const fonts = {
    display: cz.displayFont || theme.fonts.display,
    body: cz.bodyFont || theme.fonts.body,
    script: cz.scriptFont || theme.fonts.script || cz.displayFont || theme.fonts.display,
  };
  const p = theme.palette;
  const style = {
    "--bg": cz.bg || p.bg,
    "--surface": cz.bg ? `color-mix(in srgb, ${cz.bg} 92%, ${cz.text || p.text})` : p.surface,
    "--text": cz.text || p.text,
    "--muted": cz.text ? `color-mix(in srgb, ${cz.text} 62%, ${cz.bg || p.bg})` : p.muted,
    "--accent": cz.accent || p.accent,
    "--on-accent": p.onAccent,
    "--font-display": `"${fonts.display}"`,
    "--font-body": `"${fonts.body}"`,
    "--font-script": `"${fonts.script}"`,
    "--hero-h": mode === "live" ? "100svh" : mode === "demo" ? "calc(100svh - 64px)" : "780px",
    "--sticky-top": mode === "demo" ? "64px" : "0px",
  } as CSSProperties;

  const ctx = buildCtx({ theme, c: content, mode, slug, coverUrl: cz.coverUrl, photos, sampleGallery: SAMPLE_GALLERY, wishes });
  const Template = TEMPLATES[template ?? templateOf(theme)];

  return (
    <div className="inv" style={style} data-mode={mode} data-case={theme.displayCase === "upper" ? "upper" : "normal"}>
      <link rel="stylesheet" href={googleFontsHref([fonts.display, fonts.body, fonts.script])} precedence="default" />
      {mode === "live" && content.intro && (
        <Intro image={img(ctx.hero, 1600)} initials={initials(content)} names={`${ctx.p1} & ${ctx.p2}`} date={ctx.date} />
      )}
      <Template ctx={ctx} />
      <span className="inv-made">Made with Vow</span>
    </div>
  );
}
