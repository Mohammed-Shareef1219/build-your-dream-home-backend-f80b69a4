import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Design Gallery — BuildYourHome" },
      { name: "description", content: "Explore residential apartments, villas, duplexes, country houses, studios, and custom home designs." },
      { property: "og:title", content: "Design Gallery — BuildYourHome" },
      { property: "og:description", content: "Explore residential apartments, villas, duplexes, country houses, studios, and custom home designs." },
    ],
  }),
  component: GalleryPage,
});

type CardText = { alt: string; short: string; title: string; features: string[] };

const SECTION_IMAGES: Record<string, string[]> = {
  "apartments": [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop"
  ],
  "villas": [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752229-250db9f8c2b9?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753475-d6b5c7dc4e33?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752371-8d8b7d572d51?w=800&auto=format&fit=crop"
  ],
  "duplexes": [
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491366-e465dfb15b38?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491565-0526e2fc6a0d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491646-9e6e0a1df31a?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491726-7a8c9b6b5a5d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492220-9b5b6b7d1b0a?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491366-e465dfb15b38?w=800&auto=format&fit=crop"
  ],
  "country-houses": [
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752229-250db9f8c2b9?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753475-d6b5c7dc4e33?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752371-8d8b7d572d51?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752229-250db9f8c2b9?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752371-8d8b7d572d51?w=800&auto=format&fit=crop"
  ],
  "studios": [
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491366-e465dfb15b38?w=800&auto=format&fit=crop"
  ],
  "custom-designs": [
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752371-8d8b7d572d51?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop"
  ]
};

const SLUGS = ["apartments", "villas", "duplexes", "country-houses", "studios", "custom-designs"] as const;

/** Varied tile heights drive the masonry rhythm (cycled per card). */
const MASONRY_HEIGHTS = [
  "h-60 sm:h-72",
  "h-80 sm:h-96",
  "h-52 sm:h-60",
  "h-72 sm:h-80",
  "h-64 sm:h-96",
  "h-80 sm:h-[28rem]",
] as const;

function GalleryPage() {
  const { t } = useTranslation("gallery");
  const [activeSlug, setActiveSlug] = useState<string>(SLUGS[0]);
  const [showTop, setShowTop] = useState(false);
  const navRefs = useRef<Partial<Record<(typeof SLUGS)[number], HTMLAnchorElement | null>>>({});

  // Scroll-spy: highlight the collection currently under the sticky nav.
  useEffect(() => {
    const onScroll = () => {
      const probe = window.scrollY + 180;
      let current = SLUGS[0] as string;
      for (const slug of SLUGS) {
        const el = document.getElementById(slug);
        if (el && el.getBoundingClientRect().top + window.scrollY <= probe) current = slug;
      }
      setActiveSlug(current);
      setShowTop(window.scrollY > 700);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the active pill centered in the sticky nav (horizontal only).
  useEffect(() => {
    navRefs.current[activeSlug as (typeof SLUGS)[number]]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeSlug]);

  return (
    <div className="bg-background">
      {/* ===== Editorial hero ===== */}
      <section className="relative bg-hero-gradient text-primary-foreground overflow-hidden">
        <div className="pointer-events-none absolute -end-32 -top-32 h-96 w-96 rounded-full border-[3rem] border-white/10" aria-hidden />
        <div className="pointer-events-none absolute -start-24 bottom-0 h-64 w-64 rounded-full bg-white/5 blur-2xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium mb-6">
            {t("hero.badge")}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl text-balance leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mb-8">{t("hero.subtitle")}</p>
          <a
            href={`#${SLUGS[0]}`}
            className="inline-block bg-accent text-accent-foreground px-6 py-3 rounded-lg font-bold hover:-translate-y-0.5 transition shadow-soft"
          >
            {t("hero.cta")}
          </a>
        </div>
      </section>

      {/* ===== Sticky glass scroll-spy nav ===== */}
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
            {SLUGS.map((slug, i) => (
              <a
                key={slug}
                href={`#${slug}`}
                ref={(el) => { navRefs.current[slug] = el; }}
                aria-current={activeSlug === slug ? "true" : undefined}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeSlug === slug
                    ? "bg-primary text-primary-foreground shadow-soft scale-[1.03]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className="opacity-50 me-1.5 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {t(`sections.${slug}.title`)}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ===== Collection sections (masonry) ===== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {SLUGS.map((slug) => (
          <GallerySection key={slug} slug={slug} />
        ))}
      </div>

      {/* ===== Back to top ===== */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t("controls.top")}
        className={`fixed bottom-6 end-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elegant hover:bg-secondary hover:-translate-y-0.5 transition-all ${
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}

function GallerySection({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation("gallery");
  const isRtl = i18n.dir() === "rtl";
  const [lightbox, setLightbox] = useState<number | null>(null);
  const images = SECTION_IMAGES[slug] ?? [];
  const cards = (t(`sections.${slug}.cards`, { returnObjects: true }) as CardText[]) ?? [];
  const list = Array.isArray(cards) ? cards : [];
  const index = SLUGS.indexOf(slug as (typeof SLUGS)[number]) + 1;
  const total = list.length;

  // Lightbox keyboard navigation + body scroll lock.
  const open = lightbox !== null;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      const flip = isRtl ? -1 : 1;
      if (e.key === "ArrowRight") setLightbox((v) => (v === null ? v : (v + flip + total) % total));
      if (e.key === "ArrowLeft") setLightbox((v) => (v === null ? v : (v - flip + total) % total));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, total, isRtl]);

  return (
    <section id={slug} className="scroll-mt-24">
      {/* Section header: ghost index + title + count */}
      <div className="relative mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="relative ps-5">
          <span
            className="pointer-events-none absolute -top-6 start-0 select-none font-display text-7xl md:text-8xl font-bold leading-none text-primary/10"
            aria-hidden
          >
            {String(index).padStart(2, "0")}
          </span>
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">{t(`sections.${slug}.title`)}</h2>
            <p className="text-muted-foreground mt-1">{t(`sections.${slug}.subtitle`)}</p>
          </div>
        </div>
        <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground tabular-nums">
          {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Masonry grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
        {list.map((card, i) => (
          <GalleryCard
            key={i}
            card={card}
            img={images[i] ?? images[0]}
            number={i + 1}
            heightClass={MASONRY_HEIGHTS[i % MASONRY_HEIGHTS.length]}
            expandLabel={t("controls.expand")}
            onOpen={() => setLightbox(i)}
          />
        ))}
      </div>

      {/* ===== Lightbox viewer ===== */}
      {lightbox !== null && list[lightbox] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={list[lightbox].title}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label={t("controls.close")}
            className="absolute top-4 end-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-md hover:bg-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightbox] ?? images[0]}
              alt={list[lightbox].alt}
              className="max-h-[68vh] w-full rounded-2xl bg-black object-contain shadow-elegant"
            />

            {/* Prev / next — logical order mirrors in RTL */}
            <button
              type="button"
              onClick={() => setLightbox((v) => (v === null ? v : (v - (isRtl ? -1 : 1) + total) % total))}
              aria-label={t("controls.scrollLeft")}
              className="absolute start-2 sm:-start-5 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-md hover:bg-white transition"
            >
              {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => setLightbox((v) => (v === null ? v : (v + (isRtl ? -1 : 1) + total) % total))}
              aria-label={t("controls.scrollRight")}
              className="absolute end-2 sm:-end-5 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-md hover:bg-white transition"
            >
              {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>

            {/* Caption + features */}
            <div className="mt-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-3 text-white">
              <div className="min-w-0">
                <h3 className="text-lg font-bold">{list[lightbox].title}</h3>
                <p className="text-sm text-white/70">{list[lightbox].short}</p>
              </div>
              <ul className="flex max-w-md flex-wrap gap-1.5">
                {list[lightbox].features.map((f, fi) => (
                  <li
                    key={fi}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90"
                  >
                    {f}
                  </li>
                ))}
              </ul>
              <span className="text-sm font-semibold tabular-nums text-white/80">
                {t("controls.counter", { current: lightbox + 1, total })}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function GalleryCard({
  card,
  img,
  number,
  heightClass,
  expandLabel,
  onOpen,
}: {
  card: CardText;
  img: string;
  number: number;
  heightClass: string;
  expandLabel: string;
  onOpen: () => void;
}) {
  return (
    <article className="group relative mb-5 break-inside-avoid">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${card.short} — ${expandLabel}`}
        className="relative block w-full overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img
          src={img}
          alt={card.alt}
          loading="lazy"
          className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${heightClass}`}
        />

        {/* Number badge */}
        <span className="absolute top-3 start-3 grid h-7 min-w-7 place-items-center rounded-full bg-white/90 px-2 text-[11px] font-bold text-primary shadow tabular-nums">
          {String(number).padStart(2, "0")}
        </span>

        {/* Bottom scrim + short label (gradient is part of the caption, not a filter on the photo) */}
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pb-3 pt-12 text-start">
          <span className="block text-sm font-semibold text-white drop-shadow">{card.short}</span>
        </span>

        {/* Expand affordance */}
        <span className="absolute bottom-3 end-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-primary shadow opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Expand className="h-4 w-4" />
        </span>
      </button>
    </article>
  );
}
