import type { CSSProperties } from "react";
import "./invite.css";
import { initials, type Customization, type InviteContent } from "@/lib/content";
import { luminance, resolveDecorStyle } from "@/lib/decor";
import { getTheme, googleFontsHref, img, SAMPLE_GALLERY, TEMPLATE_IDS, templateOf, type TemplateId } from "@/lib/themes";
import { buildCtx, type Ctx, type Mode, type Wish } from "./ctx";
import { DecorCorners } from "./Decor";
import { Intro } from "./Intro";
import { PageEffects } from "./PageEffects";
import { StickerLayer, type StickerEditing } from "./StickerLayer";
import { Atelier } from "./templates/Atelier";
import { Bloom } from "./templates/Bloom";
import { Candlelit } from "./templates/Candlelit";
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
import { FineLine } from "./templates/FineLine";
import { Herbarium } from "./templates/Herbarium";
import { Wash } from "./templates/Wash";
import { MORE_COMPONENTS } from "./templates/more";
import { MORE_TEMPLATES } from "@/lib/templates-more";
import { registerArt, type Floral } from "@/lib/assets";
import { RegisterArt } from "./RegisterArt";

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
  atelier: Atelier,
  candlelit: Candlelit,
  bloom: Bloom,
  fineline: FineLine,
  herbarium: Herbarium,
  wash: Wash,
  ...MORE_COMPONENTS,
};

/** Designs that place their own florals (no generic corner overlay). */
const SELF_DECORATING: TemplateId[] = ["atelier", "candlelit", "bloom", "fineline", "herbarium", "wash", "gallery", "gazette", "swiss", "pop", "editorial", ...MORE_TEMPLATES.map((t) => t.id)];

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
  /** Premium sites can drop the "Made with Vow" line. */
  hideBranding?: boolean;
  /** Editor only: drag/resize/rotate placed art in the preview. */
  stickerEditing?: StickerEditing;
  /** Art the admin uploaded (so stickers and decor using it can render). */
  art?: Floral[];
}

export function InviteSite({ themeId, content, customization: cz = {}, photos = [], wishes = [], mode, slug, template, stickerEditing, hideBranding, art }: InviteSiteProps) {
  registerArt(art);
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

  const tplId: TemplateId =
    template ?? (cz.template && (TEMPLATE_IDS as string[]).includes(cz.template) ? (cz.template as TemplateId) : templateOf(theme));
  const { decor, style: axes } = resolveDecorStyle(theme, tplId, { decor: cz.decor, style: cz.style });
  const dark = luminance(cz.bg || p.bg) < 0.12;
  const ctx = buildCtx({
    theme,
    c: content,
    mode,
    slug,
    coverUrl: cz.coverUrl,
    photos,
    sampleGallery: SAMPLE_GALLERY,
    wishes,
    template: tplId,
    decor,
    style: axes,
    dark,
  });
  const Template = TEMPLATES[tplId];
  const effects = { ...(theme.effects ?? {}), ...(cz.effects ?? {}) };
  const stickers = cz.stickers ?? theme.stickers ?? [];

  return (
    <div
      className="inv"
      style={style}
      data-mode={mode}
      data-case={theme.displayCase === "upper" ? "upper" : "normal"}
      data-buttons={axes.buttons}
      data-density={axes.density}
      data-headings={axes.headings !== "theme" ? axes.headings : undefined}
      data-photo={axes.photo}
      data-sections={axes.sections}
      data-tone={dark ? "dark" : "light"}
      data-photohover={effects.photoHover ? "" : undefined}
    >
      {art && art.length > 0 && <RegisterArt art={art} />}
      <link rel="stylesheet" href={googleFontsHref([fonts.display, fonts.body, fonts.script])} precedence="default" />
      {mode === "live" && content.intro && (
        <Intro image={img(ctx.hero, 1600)} initials={initials(content)} names={`${ctx.p1} & ${ctx.p2}`} date={ctx.date} />
      )}
      <PageEffects effects={effects} />
      {!SELF_DECORATING.includes(tplId) && <DecorCorners ctx={ctx} />}
      <Template ctx={ctx} />
      {!hideBranding && <span className="inv-made">Made with Vow</span>}
      {(stickers.length > 0 || stickerEditing) && <StickerLayer stickers={stickers} editing={stickerEditing} />}
    </div>
  );
}
