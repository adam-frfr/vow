"use client";

/* eslint-disable @next/next/no-img-element */
import { floralThumb, floralUrl, type Floral } from "@/lib/assets";
import { Lottie } from "./Lottie";

/** A library item's preview: the image, or the animation playing. */
export function ArtThumb({ art, className = "" }: { art: Floral; className?: string }) {
  if (art.format === "lottie") return <Lottie src={floralUrl(art.id)} className={className} />;
  return <img src={floralThumb(art.id)} alt={art.name} loading="lazy" className={className} />;
}
