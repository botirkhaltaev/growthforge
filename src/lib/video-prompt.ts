import type { AdVariant } from "./types";

/** Build a cinematic vertical ad prompt from the brief + winning variant. */
export function buildVideoPrompt(brief: string, variant: AdVariant): string {
  const product = brief.trim() || `${variant.brand} — ${variant.headline}`;
  const scene =
    variant.visualCaption?.replace(/^v[A-C]\s*·\s*/i, "").trim() ||
    "lifestyle product moment";

  return [
    `A polished 8-second vertical social video ad (9:16) for ${variant.brand}.`,
    `Product context: ${product}.`,
    `Scene: ${scene}, product-forward, warm natural light, cinematic motion.`,
    `Mood matches the headline "${variant.headline}".`,
    `Supporting message: ${variant.body}`,
    `End on a clear call to action: "${variant.cta}".`,
    `Price cue: ${variant.price}.`,
    "No logos or unreadable text overlays. Smooth camera, coherent physics, upbeat synchronized audio.",
  ].join(" ");
}
