import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import mountAgiba1 from "@/assets/hero/mount-agiba-1.jpg";
import mountAgiba2 from "@/assets/hero/mount-agiba-2.jpg";
import mountAgiba3 from "@/assets/hero/mount-agiba-3.jpg";
import mountCity1 from "@/assets/hero/mount-city-1.jpg";
import mountCity2 from "@/assets/hero/mount-city-2.jpg";

const SLIDES = [
  { src: mountAgiba1, alt: "Mount City — Marsa Matrouh promotional poster" },
  { src: mountAgiba2, alt: "Mount Agiba — Marsa Matrouh promotional poster" },
  { src: mountAgiba3, alt: "Mount Agiba Resort villas poster" },
  { src: mountCity1, alt: "Rooya El-Mostaqbal coastal city development poster" },
  { src: mountCity2, alt: "Mount City aerial site plan poster" },
];

const AUTOPLAY_MS = 4500;

export function HeroShowcase() {
  const { t } = useTranslation("home");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;
  const timer = useRef<number | null>(null);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused) return;
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, [paused, count]);

  return (
    <div
      className="group relative w-full max-w-md mx-auto aspect-[4/5] max-h-[560px] rounded-3xl overflow-hidden shadow-elegant ring-1 ring-white/20 bg-black/30"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label={t("hero.showcase.label")}
    >
      {SLIDES.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          loading={i === 0 ? "eager" : "lazy"}
          aria-hidden={i !== index}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
            i === index ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]"
          }`}
        />
      ))}

      {/* Arrows */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label={t("hero.showcase.prev")}
        className="absolute start-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 backdrop-blur border border-white/30 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-white/40"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label={t("hero.showcase.next")}
        className="absolute end-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 backdrop-blur border border-white/30 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-white/40"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 inset-x-0 z-10 flex items-center justify-center gap-1.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={t("hero.showcase.goto", { index: i + 1 })}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
