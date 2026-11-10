import type { ReactNode } from "react";
import type { MoreTemplateId } from "@/lib/templates-more";
import type { Ctx } from "../../ctx";
import { Bento, IndexSide, Marquee, Slides, Stack, Timeline } from "./structure";
import { Booth, Collage, CoverReveal, Diptych, Lookbook, Panes } from "./photo";
import { Calendar, Passport, Spread, Stamps, Tags, Vinyl } from "./keepsake";
import { Arbor, Cameo, Crest, Deco, Illuminated, Ribbon } from "./ornate";
import { Diagonal, Fold, Halo, Ombre, Quiet, Specimen, Verse, Washi } from "./modern";
import { CardFan, Escort, FlipClock, Hotel, Journey, Notebook, Planner, Sign, Zine } from "./party";
import { Menu, Programme, Recipe, Telegram, Ticket, WineLabel } from "./paper";

export const MORE_COMPONENTS: Record<MoreTemplateId, (p: { ctx: Ctx }) => ReactNode> = {
  menu: Menu,
  programme: Programme,
  recipe: Recipe,
  telegram: Telegram,
  ticket: Ticket,
  winelabel: WineLabel,
  stack: Stack,
  slides: Slides,
  timeline: Timeline,
  index: IndexSide,
  bento: Bento,
  marquee: Marquee,
  booth: Booth,
  lookbook: Lookbook,
  diptych: Diptych,
  cover: CoverReveal,
  panes: Panes,
  collage: Collage,
  passport: Passport,
  calendar: Calendar,
  vinyl: Vinyl,
  spread: Spread,
  stamps: Stamps,
  tags: Tags,
  illuminated: Illuminated,
  deco: Deco,
  crest: Crest,
  arbor: Arbor,
  ribbon: Ribbon,
  cameo: Cameo,
  quiet: Quiet,
  washi: Washi,
  halo: Halo,
  diagonal: Diagonal,
  ombre: Ombre,
  verse: Verse,
  fold: Fold,
  specimen: Specimen,
  countdown: FlipClock,
  zine: Zine,
  sign: Sign,
  escort: Escort,
  planner: Planner,
  journey: Journey,
  hotel: Hotel,
  notebook: Notebook,
  fan: CardFan,
};
