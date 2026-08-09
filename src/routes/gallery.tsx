import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

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



function GalleryPage() {
  const { t } = useTranslation("gallery");
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative bg-hero-gradient text-primary-foreground py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{t("hero.title")}</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">{t("hero.subtitle")}</p>
          <a href="#apartments" className="inline-block bg-accent text-accent-foreground px-6 py-3 rounded-lg font-bold hover:-translate-y-0.5 transition shadow-soft">
            {t("hero.cta")}
          </a>
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
        {SLUGS.map((slug) => (
          <GallerySection key={slug} slug={slug} />
        ))}
      </div>
    </div>
  );
}

function GallerySection({ slug }: { slug: string }) {
  const { t } = useTranslation("gallery");
  const trackRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
  const images = SECTION_IMAGES[slug] ?? [];
  const cards = (t(`sections.${slug}.cards`, { returnObjects: true }) as CardText[]) ?? [];
  return (
    <section id={slug} className="scroll-mt-24">
      <div className="mb-6 ps-4 border-s-4 border-secondary">
        <h2 className="text-2xl md:text-3xl font-bold text-primary">{t(`sections.${slug}.title`)}</h2>
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
            <GalleryCard key={i} card={card} img={images[i] ?? images[0]} more={t("controls.more")} />
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

function GalleryCard({ card, img, more }: { card: CardText; img: string; more: string }) {
  return (
    <article className="group relative w-[260px] flex-shrink-0 snap-start rounded-2xl overflow-hidden bg-card shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-[180px] overflow-hidden">
        <img
          src={img}
          alt={card.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-primary/85 text-primary-foreground px-4 py-2 text-sm font-medium">
          {card.short}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/95 text-primary-foreground p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col">
          <button className="self-end bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-bold mb-2 hover:scale-105 transition">
            {more}
          </button>
          <h3 className="text-base font-bold mb-2">{card.title}</h3>
          <ul className="text-xs space-y-1 list-disc list-inside opacity-95">
            {card.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
