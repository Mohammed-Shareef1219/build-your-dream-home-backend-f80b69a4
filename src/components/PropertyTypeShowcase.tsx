import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MapPin, Ruler, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import montCityImg from "@/assets/land-mont-city.jpg";
import mountAgibaImg from "@/assets/land-mount-agiba.jpg";

/* ---------------- Shared showcase data (used by Home + Property Types) ---------------- */

export interface ShowcaseCard {
  slug: string;
  image: string;
  rating: number;
  properties: number;
  builder: string;
  seller: string;
  contact: string;
  custom?: boolean;
}

export const SHOWCASE: ShowcaseCard[] = [
  {
    slug: "apartment",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&auto=format&fit=crop",
    rating: 4.7,
    properties: 38,
    builder: "Aurora Developments",
    seller: "Lina Haddad",
    contact: "+971 50 123 4567",
  },
  {
    slug: "villa",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&auto=format&fit=crop",
    rating: 4.9,
    properties: 21,
    builder: "Palm Crown Builders",
    seller: "Omar Al-Faris",
    contact: "+971 52 988 7710",
  },
  {
    slug: "duplex",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&auto=format&fit=crop",
    rating: 4.6,
    properties: 27,
    builder: "Skyline Residences",
    seller: "Yasmin Karimi",
    contact: "+971 55 660 4422",
  },
  {
    slug: "country_house",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=900&auto=format&fit=crop",
    rating: 4.8,
    properties: 14,
    builder: "EarthForm Studio",
    seller: "Hassan Noor",
    contact: "+971 56 230 1188",
  },
  {
    slug: "studio",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&auto=format&fit=crop",
    rating: 4.5,
    properties: 52,
    builder: "Nest Micro Homes",
    seller: "Reem Saleh",
    contact: "+971 50 774 9931",
  },
  {
    slug: "custom",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&auto=format&fit=crop",
    rating: 5.0,
    properties: 0,
    builder: "BuildYourHome Atelier",
    seller: "Design Concierge",
    contact: "+971 50 000 1010",
    custom: true,
  },
];

export interface LandProject {
  key: "mont_city" | "mount_agiba";
  code: string;
  image: string;
  rating: number;
  area: string;
}

export const LAND_PROJECTS: LandProject[] = [
  { key: "mont_city", code: "IB-2026-A1", image: montCityImg, rating: 4.9, area: "200 m²" },
  { key: "mount_agiba", code: "IB-2026-A2", image: mountAgibaImg, rating: 4.9, area: "200 m²" },
];

export const LAND_CONTACTS = ["01020010906", "01020010905", "01155405831"];

export function ShowcaseCardView({ card }: { card: ShowcaseCard }) {
  const { t } = useTranslation("propertyTypes");
  const isCustom = card.custom;
  const badge = t(`showcase.cards.${card.slug}.badge`);
  const title = t(`showcase.cards.${card.slug}.title`);
  const description = t(`showcase.cards.${card.slug}.description`);
  const features = t(`showcase.cards.${card.slug}.features`, { returnObjects: true }) as string[];
  const price = t(`showcase.cards.${card.slug}.price`);
  return (
    <article
      className={`group rounded-2xl overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 flex flex-col ${
        isCustom ? "bg-secondary text-secondary-foreground" : "bg-card"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={card.image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-soft">
          {badge}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className={`mt-2 text-sm ${isCustom ? "text-secondary-foreground/85" : "text-muted-foreground"}`}>
          {description}
        </p>

        <ul className="mt-5 space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <CheckCircle2
                className={`size-4 shrink-0 ${isCustom ? "text-accent" : "text-secondary"}`}
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* Meta strip */}
        <div
          className={`mt-5 grid grid-cols-3 gap-2 text-center text-xs rounded-xl py-3 ${
            isCustom ? "bg-white/10" : "bg-muted/60"
          }`}
        >
          <div>
            <div className="font-bold text-base">★ {card.rating.toFixed(1)}</div>
            <div className={isCustom ? "text-secondary-foreground/70" : "text-muted-foreground"}>{t("showcase.ratingLabel")}</div>
          </div>
          <div>
            <div className="font-bold text-base">{card.properties || "—"}</div>
            <div className={isCustom ? "text-secondary-foreground/70" : "text-muted-foreground"}>{t("showcase.listingsLabel")}</div>
          </div>
          <div>
            <div className={`font-bold text-base ${isCustom ? "text-accent" : "text-secondary"}`}>{t("showcase.verified")}</div>
            <div className={isCustom ? "text-secondary-foreground/70" : "text-muted-foreground"}>{t("showcase.builderLabel")}</div>
          </div>
        </div>

        {/* Builder / seller / contact */}
        <div
          className={`mt-4 text-xs space-y-1 ${
            isCustom ? "text-secondary-foreground/85" : "text-muted-foreground"
          }`}
        >
          <div><span className="font-semibold">{t("showcase.builderLabel")}:</span> {card.builder}</div>
          <div><span className="font-semibold">{t("showcase.sellerLabel")}:</span> {card.seller}</div>
          <div><span className="font-semibold">{t("showcase.contactLabel")}:</span> {card.contact}</div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-3 pt-4 border-t border-foreground/10">
          <div className={`font-bold text-base ${isCustom ? "" : "text-primary"}`}>
            {price}
          </div>
          {isCustom ? (
            <Button asChild variant="outline" className="bg-white text-secondary hover:bg-white/90 border-white">
              <Link to="/consultation">
                {t("showcase.startDesigning")} <ArrowRight />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="brand" size="sm">
              <Link to="/catalog/$slug" params={{ slug: card.slug }}>
                {t("showcase.explore")} <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function LandShowcaseCard({ project }: { project: LandProject }) {
  const { t } = useTranslation("propertyTypes");
  const name = t(`land.projects.${project.key}.name`);
  const arabicName = t(`land.projects.${project.key}.arabicName`);
  const design = t(`land.projects.${project.key}.design`);
  const features = t("land.features", { returnObjects: true }) as string[];
  return (
    <article className="group rounded-2xl overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 flex flex-col bg-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={project.image}
          alt={name}
          loading="lazy"
          width={1200}
          height={900}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-soft">
          {t("land.badge")}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="text-sm text-muted-foreground">{arabicName}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-secondary shrink-0">
            <Star className="size-4 fill-current" /> {project.rating.toFixed(1)}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{design}</p>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Ruler className="size-4 text-secondary shrink-0" />
            <span>
              <span className="text-muted-foreground">{t("land.areaLabel")}:</span> {project.area}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="size-4 text-secondary shrink-0 mt-0.5" />
            <span className="text-foreground/80">{t("land.location")}</span>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="size-4 shrink-0 text-secondary mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 text-xs space-y-1 text-muted-foreground">
          <div><span className="font-semibold">{t("showcase.builderLabel")}:</span> {t("land.builder")}</div>
          <div><span className="font-semibold">{t("showcase.sellerLabel")}:</span> {t("land.seller")}</div>
          <div className="flex flex-wrap gap-x-2">
            <span className="font-semibold">{t("showcase.contactLabel")}:</span>
            {LAND_CONTACTS.map((c) => (
              <a key={c} href={`tel:${c}`} className="text-secondary hover:underline" dir="ltr">
                {c}
              </a>
            ))}
          </div>
          <div>{t("land.codeLabel")}: {project.code}</div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-3 pt-4 border-t border-foreground/10">
          <div className="font-bold text-base text-primary">{t("land.priceRange")}</div>
          <Button asChild variant="brand" size="sm">
            <Link to="/catalog/$slug/$code" params={{ slug: "land", code: project.code }}>
              {t("showcase.explore")} <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Full 8-card grid: 6 property types + 2 land projects. */
export function PropertyTypesShowcaseGrid() {
  return (
    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {SHOWCASE.map((c) => (
        <ShowcaseCardView key={c.slug} card={c} />
      ))}
      {LAND_PROJECTS.map((lp) => (
        <LandShowcaseCard key={lp.code} project={lp} />
      ))}
    </div>
  );
}
