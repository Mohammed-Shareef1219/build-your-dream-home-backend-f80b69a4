import { SHOWCASE, LAND_PROJECTS } from "@/components/PropertyTypeShowcase";

/**
 * Hero carousel frames for the Property Types page — one per property type,
 * including the Mont City / Mount Agiba land plots. Hero rotates one frame
 * every 5 seconds. Imagery reuses each type's showcase photos so every frame
 * genuinely reflects its own typology.
 *
 * Order: apartments, villas, duplexes, smart homes, country houses,
 * land plots (Mont City, Mont Agiba), studios.
 */
export interface HeroCarouselFrame {
  labelKey: string;
  src: string;
}

function framesFor(slug: string): HeroCarouselFrame[] {
  const card = SHOWCASE.find((c) => c.slug === slug);
  if (!card) return [];
  return [card.image, card.image2].map((src) => ({ labelKey: slug, src }));
}

/** SHOWCASE has no "smart_home" card — reuse the atelier's modern-home photography. */
const SMART_HOME_FRAMES: HeroCarouselFrame[] = [
  ...framesFor("custom").map((f) => ({ ...f, labelKey: "smart_home" })),
];

export const HERO_CAROUSEL: HeroCarouselFrame[] = [
  ...framesFor("apartment"),
  ...framesFor("villa"),
  ...framesFor("duplex"),
  ...SMART_HOME_FRAMES,
  ...framesFor("country_house"),
  ...LAND_PROJECTS.map(
    (lp): HeroCarouselFrame => ({ labelKey: "land", src: lp.image }),
  ),
  ...framesFor("studio"),
];
