import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

import mountCity1 from "@/assets/hero/mount-city-1.jpg";
import mountAgiba1 from "@/assets/hero/mount-agiba-1.jpg";
import mountCity2 from "@/assets/hero/mount-city-2.jpg";
import mountAgiba2 from "@/assets/hero/mount-agiba-2.jpg";
import mountAgiba3 from "@/assets/hero/mount-agiba-3.jpg";

/** Auto-advance interval in milliseconds (6 seconds). */
const INTERVAL = 6000;

/**
 * Roya project slides, shown at (or below) their natural size so every line of
 * text on the artwork stays crisp: `poster` = portrait/square flyers driven by
 * height, `wide` = landscape renders capped at native 720px width.
 */
const SLIDES = [
  { src: mountCity1, altKey: "hero.slider.alts.mountCity1", size: "poster" },
  { src: mountAgiba1, altKey: "hero.slider.alts.mountAgiba1", size: "poster" },
  { src: mountCity2, altKey: "hero.slider.alts.mountCity2", size: "wide" },
  { src: mountAgiba2, altKey: "hero.slider.alts.mountAgiba2", size: "poster" },
  { src: mountAgiba3, altKey: "hero.slider.alts.mountAgiba3", size: "poster" },
] as const;

const SIZE_CLASSES = {
  poster: "h-[300px] sm:h-[380px] lg:h-[440px] w-auto max-w-full",
  wide: "w-full max-w-[560px] h-auto",
} as const;

/**
 * Softly blurred enlargement of the active slide, filling the hero background.
 * Keeps the surrounding space bright and colorful — no dark masks or gradients.
 */
export function HeroBackdrop() {
  const [index] = useState(0);

  return (
    <div className="absolute inset-0 overflow-hidden bg-background" aria-hidden>
      {SLIDES.map((slide, i) => (
        <img
          key={slide.altKey}
          src={slide.src}
          alt=""
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className={`absolute inset-0 h-full w-full object-cover scale-110 blur-2xl saturate-[1.25] transition-opacity duration-[1200ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * The project artwork itself, in its own clear zone of the hero:
 * contained at native scale (never stretched, never zoomed) so its text stays
 * sharp for reading, positioned beside — never under — the headline and search.
 * Autopause while hovered/focused; RTL-aware prev/next buttons + dots.
 */
export function HeroSlider() {
  const { t, i18n } = useTranslation("home");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const isRtl = i18n.dir() === "rtl";
  const count = SLIDES.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  // Auto-advance every 6s. `index` in deps restarts the timer after manual
  // navigation so a freshly chosen slide always gets its full 6 seconds.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearInterval(id);
  }, [paused, count, index]);

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div
      className="relative w-full flex flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={t("hero.slider.label")}
    >
      <div className="relative flex items-center justify-center w-full">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.altKey}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[1200ms] ease-in-out ${
              i === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            aria-hidden={i !== index}
          >
            {/* The artwork at native scale — zero filters, zero zoom */}
            <img
              src={slide.src}
              alt={i === index ? t(slide.altKey) : ""}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              className={`object-cover object-top rounded-2xl shadow-elegant ring-1 ring-black/10 ${SIZE_CLASSES[slide.size]}`}
            />
          </div>
        ))}
        {/* Reserved height so the absolutely-positioned slides define layout:
            matches the tallest poster + its frame */}
        <div className="h-[300px] sm:h-[380px] lg:h-[440px] w-full pointer-events-none" aria-hidden />

        {/* Manual navigation — prev/next (logical start/end so it mirrors in RTL) */}
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label={t("hero.slider.prev")}
          className="absolute start-1 sm:start-3 top-1/2 -translate-y-1/2 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-primary shadow-md hover:bg-white hover:scale-105 transition-all"
        >
          <PrevIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label={t("hero.slider.next")}
          className="absolute end-1 sm:end-3 top-1/2 -translate-y-1/2 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-primary shadow-md hover:bg-white hover:scale-105 transition-all"
        >
          <NextIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Interactive dot indicators below the artwork */}
      <div
        className="mt-3 flex items-center justify-center gap-2.5"
        role="tablist"
        aria-label={t("hero.slider.dots")}
      >
        {SLIDES.map((slide, i) => (
          <button
            key={slide.altKey}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={t(slide.altKey)}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-7 bg-primary shadow-md" : "w-2 bg-primary/25 hover:bg-primary/45"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
