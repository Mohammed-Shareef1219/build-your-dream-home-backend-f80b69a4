import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Home,
  Layers,
  Leaf,
  Satellite,
  Square,
  X,
} from "lucide-react";
import landMountAgibaImg from "@/assets/land-mount-agiba.jpg";
import landMountAgiba2Img from "@/assets/land-mount-agiba-2.jpg";
import mountAgiba7Img from "@/assets/mount-agiba-7.png";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Design Gallery — BuildYourHome" },
      {
        name: "description",
        content:
          "Explore residential apartments, villas, duplexes, country houses, studios, custom and smart home designs, plus premium land plots in Mont City and Mount Agiba.",
      },
      { property: "og:title", content: "Design Gallery — BuildYourHome" },
      {
        property: "og:description",
        content:
          "Explore residential apartments, villas, duplexes, country houses, studios, custom and smart home designs, plus premium land plots in Mont City and Mount Agiba.",
      },
    ],
  }),
  component: GalleryPage,
});

type CardText = { alt: string; short: string; title: string; features: string[] };

const SECTION_IMAGES: Record<string, string[]> = {
  apartments: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop",
  ],
  villas: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752229-250db9f8c2b9?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753475-d6b5c7dc4e33?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752371-8d8b7d572d51?w=800&auto=format&fit=crop",
  ],
  duplexes: [
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491366-e465dfb15b38?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491565-0526e2fc6a0d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491646-9e6e0a1df31a?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491726-7a8c9b6b5a5d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492220-9b5b6b7d1b0a?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491366-e465dfb15b38?w=800&auto=format&fit=crop",
  ],
  "country-houses": [
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752229-250db9f8c2b9?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753475-d6b5c7dc4e33?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752371-8d8b7d572d51?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop",
  ],
  studios: [
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491366-e465dfb15b38?w=800&auto=format&fit=crop",
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
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop",
  ],
  "smart-homes": [
    "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517167685284-96a27681ad75?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601760561441-16420502c7e0?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop",
  ],
  "lands-mont-city": [
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1471922694854-ff1fe63f58ac?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1439066615861-d1af74d74020?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
  ],
  "lands-mount-agiba": [
    landMountAgibaImg,
    landMountAgiba2Img,
    mountAgiba7Img,
    "https://images.unsplash.com/photo-1519554340195-be4db8e6ffbb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523531294919-4bcd7ba65e9f?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520637736862-4d197d17c93a?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1533619239233-6280475a633a?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502786129293-79981df4e689?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509057199511-5f6bdfa12c79?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800&auto=format&fit=crop",
  ],
};

const SLUGS = [
  "apartments",
  "villas",
  "duplexes",
  "country-houses",
  "studios",
  "smart-homes",
  "custom-designs",
  "lands-mont-city",
  "lands-mount-agiba",
] as const;

/** Per-section badge icons; everything else falls back to Home. */
const SECTION_ICONS: Partial<Record<string, typeof Home>> = {
  apartments: Building2,
  villas: Home,
  duplexes: Layers,
  "country-houses": Leaf,
  studios: Square,
  "smart-homes": Cpu,
  "lands-mont-city": Satellite,
  "lands-mount-agiba": Satellite,
};

/** Property types featured in the hero, rotated every SLIDE_INTERVAL_MS. */
const HERO_SLIDES = [
  "apartments",
  "villas",
  "duplexes",
  "smart-homes",
  "country-houses",
  "lands-mont-city",
  "lands-mount-agiba",
  "studios",
] as const;

const SLIDE_INTERVAL_MS = 5000;

function GalleryPage() {
  const { t } = useTranslation("gallery");
  /** Active card inside the modal viewer. */
  const [viewer, setViewer] = useState<{ slug: string; index: number } | null>(null);

  /* Hero slideshow — auto-advances every 5 seconds. */
  const [slide, setSlide] = useState(0);
  const [failedSlides, setFailedSlides] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const id = setInterval(
      () => setSlide((s) => (s + 1) % HERO_SLIDES.length),
      SLIDE_INTERVAL_MS,
    );
    return () => clearInterval(id);
    // Restart the 5s cadence whenever the slide changes (incl. manual dot clicks).
  }, [slide]);

  const closeViewer = useCallback(() => setViewer(null), []);

  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") moveViewer(1);
      if (e.key === "ArrowLeft") moveViewer(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, closeViewer]);

  const moveViewer = (dir: number) => {
    setViewer((v) => {
      if (!v) return v;
      const cards = t(`sections.${v.slug}.cards`, { returnObjects: true }) as CardText[];
      const count = Array.isArray(cards) ? cards.length : 0;
      if (count === 0) return v;
      return { ...v, index: (v.index + dir + count) % count };
    });
  };

  return (
    <div className="bg-background">
      {/* Hero — rotating property-type slideshow */}
      <section className="relative text-primary-foreground py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient">
          {HERO_SLIDES.map((slug, i) => {
            const img = SECTION_IMAGES[slug]?.[0];
            const active = i === slide;
            return (
              <div
                key={slug}
                aria-hidden={!active}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              >
                {img && !failedSlides[slug] ? (
                  <img
                    src={img}
                    alt=""
                    loading={i === 0 ? "eager" : "lazy"}
                    onError={() =>
                      setFailedSlides((f) => ({ ...f, [slug]: true }))
                    }
                    className={`h-full w-full object-cover ${active ? "scale-105" : "scale-100"} transition-transform duration-[5000ms] ease-linear`}
                  />
                ) : (
                  <div className="h-full w-full bg-hero-gradient" />
                )}
              </div>
            );
          })}
          {/* Readability overlay for hero text */}
          <div className="absolute inset-0 bg-primary/75" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{t("hero.title")}</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">{t("hero.subtitle")}</p>
          <a
            href="#apartments"
            className="inline-block bg-accent text-accent-foreground px-6 py-3 rounded-lg font-bold hover:-translate-y-0.5 transition shadow-soft"
          >
            {t("hero.cta")}
          </a>
          {/* Per-slide accompanying text — re-animates on every slide change */}
          <div key={slide} className="mt-10 flex flex-col items-center gap-3">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center gap-2">
              <span className="uppercase tracking-[0.2em] text-xs font-semibold text-accent">
                {t("hero.slideEyebrow")}
              </span>
              <h2 className="text-2xl md:text-4xl font-bold">
                {t(`sections.${HERO_SLIDES[slide]}.title`)}
              </h2>
              <p className="text-base md:text-lg opacity-90 max-w-xl">
                {t(`sections.${HERO_SLIDES[slide]}.subtitle`)}
              </p>
              <a
                href={`#${HERO_SLIDES[slide]}`}
                className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-5 py-2 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition"
              >
                {t("hero.viewSection")}
                <ChevronDown className="h-4 w-4" />
              </a>
            </div>
            <div className="flex gap-2">
              {HERO_SLIDES.map((slug, i) => (
                <button
                  key={slug}
                  onClick={() => setSlide(i)}
                  aria-label={t(`sections.${slug}.title`)}
                  aria-pressed={i === slide}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === slide ? "w-6 bg-accent" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky category nav */}
      <nav className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 md:gap-4 overflow-x-auto py-3 no-scrollbar">
            {SLUGS.map((slug) => (
              <a
                key={slug}
                href={`#${slug}`}
                className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium bg-white/10 hover:bg-secondary transition"
              >
                {t(`sections.${slug}.title`)}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Sections */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {SLUGS.map((slug, sIdx) => (
          <GallerySection key={slug} slug={slug} refNumber={sIdx + 1} onOpen={setViewer} />
        ))}
      </div>

      {/* Modal image viewer */}
      {viewer && (
        <ViewerModal
          slug={viewer.slug}
          index={viewer.index}
          onClose={closeViewer}
          onMove={moveViewer}
        />
      )}
    </div>
  );
}

function GallerySection({
  slug,
  refNumber,
  onOpen,
}: {
  slug: string;
  refNumber: number;
  onOpen: (v: { slug: string; index: number }) => void;
}) {
  const { t } = useTranslation("gallery");
  const trackRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 320 * (document.dir === "rtl" ? -1 : 1), behavior: "smooth" });
  };
  const images = SECTION_IMAGES[slug] ?? [];
  const cards = t(`sections.${slug}.cards`, { returnObjects: true }) as CardText[];
  const Icon = SECTION_ICONS[slug] ?? Home;
  return (
    <section id={slug} className="scroll-mt-24">
      <div className="mb-6 ps-4 border-s-4 border-secondary">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-secondary" />
          <h2 className="text-2xl md:text-3xl font-bold text-primary">{t(`sections.${slug}.title`)}</h2>
        </div>
        <p className="text-muted-foreground mt-1">{t(`sections.${slug}.subtitle`)}</p>
      </div>

      <div className="relative group">
        <button
          aria-label={t("controls.scrollLeft")}
          onClick={() => scroll(-1)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elegant hover:bg-secondary transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
        >
          {(Array.isArray(cards) ? cards : []).map((card, i) => (
            <GalleryCard
              key={i}
              card={card}
              img={images[i % Math.max(1, images.length)] ?? ""}
              refNumber={`${String(refNumber).padStart(2, "0")}-${i + 1}`}
              more={t("controls.more")}
              onOpen={() => onOpen({ slug, index: i })}
            />
          ))}
        </div>

        <button
          aria-label={t("controls.scrollRight")}
          onClick={() => scroll(1)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elegant hover:bg-secondary transition"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

function GalleryCard({
  card,
  img,
  refNumber,
  more,
  onOpen,
}: {
  card: CardText;
  img: string;
  refNumber: string;
  more: string;
  onOpen: () => void;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    // Reset the fallback flag when the card's image source changes.
    setFailed(false);
  }, [img]);
  const features = Array.isArray(card?.features) ? card.features : [];
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group relative w-[280px] flex-shrink-0 snap-start rounded-2xl overflow-hidden bg-card shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary"
    >
      <div className="relative h-[200px] overflow-hidden">
        {failed || !img ? (
          <div
            aria-label={card.alt}
            className="h-full w-full grid place-items-center bg-muted text-muted-foreground text-sm font-medium px-4 text-center"
          >
            {card.short || card.title}
          </div>
        ) : (
          <img
            src={img}
            alt={card.alt}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        {/* Reference number chip + short label */}
        <span className="absolute top-3 left-3 rounded-full bg-primary/85 text-primary-foreground px-2.5 py-0.5 text-[11px] font-bold tracking-wider">
          {refNumber}
        </span>
        <div className="absolute bottom-0 left-0 right-0 bg-primary/85 text-primary-foreground px-4 py-2.5 text-sm font-semibold">
          <span className="block truncate">{card.short}</span>
          <span className="block text-[11px] font-normal text-primary-foreground/75 truncate">
            {card.title}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/95 text-primary-foreground p-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="self-end bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-bold mb-2 hover:scale-105 transition"
          >
            {more}
          </button>
          <h3 className="text-base font-bold mb-2">{card.title}</h3>
          <ul className="text-xs space-y-1 list-disc list-inside opacity-95 overflow-auto">
            {features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function ViewerModal({
  slug,
  index,
  onClose,
  onMove,
}: {
  slug: string;
  index: number;
  onClose: () => void;
  onMove: (dir: number) => void;
}) {
  const { t } = useTranslation("gallery");
  const cards = t(`sections.${slug}.cards`, { returnObjects: true }) as CardText[];
  const images = SECTION_IMAGES[slug] ?? [];
  const card = cards[index];
  const img = images[index % Math.max(1, images.length)] ?? "";
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [img]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={card?.title}
    >
      <div
        className="relative max-w-3xl w-full rounded-2xl overflow-hidden bg-card shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label={t("controls.close")}
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-9 w-9 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative h-[52vh] min-h-[260px] bg-muted">
          {failed || !img ? (
            <div className="h-full w-full grid place-items-center text-muted-foreground text-sm px-6 text-center">
              {card?.short || card?.title || t("controls.more")}
            </div>
          ) : (
            <img
              key={img}
              src={img}
              alt={card?.alt}
              onError={() => setFailed(true)}
              className="h-full w-full object-cover"
            />
          )}
          <button
            aria-label={t("controls.scrollLeft")}
            onClick={() => onMove(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center rounded-full bg-black/55 text-white hover:bg-black/75 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label={t("controls.scrollRight")}
            onClick={() => onMove(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center rounded-full bg-black/55 text-white hover:bg-black/75 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-primary">{card?.title}</h3>
            <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {index + 1} / {cards.length}
            </span>
          </div>
          <ul className="grid sm:grid-cols-2 gap-2">
            {(card?.features ?? []).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
