import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Building2,
  Home as HomeIcon,
  MapPin,
  Wallet,
  Users,
  Clock,
  BadgeCheck,
  Phone,
  Landmark,
  Mountain,
  TreePine,
  Maximize,
  Wifi,
  Store,
  TrendingUp,
  Globe,
  Filter,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { HeroSearch } from "@/components/home/HeroSearch";
import { HeroSlider, HeroBackdrop } from "@/components/home/HeroSlider";
import { PriceTrend } from "@/components/home/PriceTrend";
import { BudgetPlanner } from "@/components/home/BudgetPlanner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import partnerMountCity from "@/assets/partner-mount-city.png";
import partnerMountAgiba from "@/assets/partner-mount-agiba.png";
import mountCitySea from "@/assets/mount-city-sea.jpg";
import mountCityDev from "@/assets/mount-city-development.jpg";
import mountAgibaResort from "@/assets/mount-agiba-resort.jpg";
import mountAgibaSea from "@/assets/mount-agiba-sea.jpg";
import landType1 from "@/assets/type-land-1.jpg";
import landType2 from "@/assets/type-land-2.jpg";
import agibaType1 from "@/assets/type-agiba-1.jpg";
import agibaType2 from "@/assets/type-agiba-2.jpg";
import apartments1 from "@/assets/type-apartments-1.jpg";
import apartments2 from "@/assets/type-apartments-2.jpg";
import duplexes1 from "@/assets/type-duplexes-1.jpg";
import duplexes2 from "@/assets/type-duplexes-2.jpg";
import villas1 from "@/assets/type-villas-1.jpg";
import villas2 from "@/assets/type-villas-2.jpg";
import smartHomes1 from "@/assets/type-smart-homes-1.jpg";
import smartHomes2 from "@/assets/type-smart-homes-2.jpg";
import studios1 from "@/assets/type-studios-1.jpg";
import studios2 from "@/assets/type-studios-2.jpg";
import countryHouses1 from "@/assets/type-country-houses-1.jpg";
import countryHouses2 from "@/assets/type-country-houses-2.jpg";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BuildYourHome — Smart Real Estate Marketing" },
      {
        name: "description",
        content:
          "Find your dream property smartly. Villas, apartments, and commercial spaces from 80m² to 300m² — AI-powered search, free consultation, and transparent pricing.",
      },
    ],
  }),
  component: IndexPage,
});

/** The 8 property-type cards shown on the homepage (2 photos each). */
const TYPE_CARDS = [
  { key: "land", images: [landType1, landType2], Icon: Landmark },
  { key: "resortLand", images: [agibaType1, agibaType2], Icon: Mountain },
  { key: "apartments", images: [apartments1, apartments2], Icon: Building2 },
  { key: "duplexes", images: [duplexes1, duplexes2], Icon: HomeIcon },
  { key: "villas", images: [villas1, villas2], Icon: TreePine },
  { key: "smartHomes", images: [smartHomes1, smartHomes2], Icon: Wifi },
  { key: "studios", images: [studios1, studios2], Icon: Store },
  { key: "countryHouses", images: [countryHouses1, countryHouses2], Icon: TreePine },
] as const;

function IndexPage() {
  const { t, i18n } = useTranslation("home");
  const { t: tc } = useTranslation("common");
  const [featured, setFeatured] = useState<Property[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const isRtl = i18n.dir() === "rtl";

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setFeatured(data ?? []));
  }, []);

  useEffect(() => {
    if (!user) return setFavIds(new Set());
    supabase
      .from("favorites")
      .select("property_id")
      .eq("user_id", user.id)
      .then(({ data }) => setFavIds(new Set(data?.map((f) => f.property_id) ?? [])));
  }, [user]);

  return (
    <>
      {/* ===== Hero: project artwork beside the headline + advanced search bar ===== */}
      <section className="relative overflow-hidden text-foreground dark:text-white">
        <HeroBackdrop />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
            {/* Copy + search — its own clear zone for reading and interaction */}
            <div>
              <div className="text-center lg:text-start mb-8">
                <span className="inline-flex items-center gap-2 bg-white/55 dark:bg-black/25 backdrop-blur-sm border border-black/15 dark:border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-6 shadow-md">
                  <Sparkles className="h-4 w-4 text-accent" /> {t("hero.badge")}
                </span>
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold mb-5 text-balance leading-tight [text-shadow:0_1px_20px_rgba(255,255,255,0.55)] dark:[text-shadow:0_2px_28px_rgba(0,0,0,0.65),0_1px_4px_rgba(0,0,0,0.55)]">
                  {t("hero.titleLine1")}{" "}
                  <span className="font-display text-accent dark:[text-shadow:0_2px_28px_rgba(0,0,0,0.65),0_1px_4px_rgba(0,0,0,0.55)]">
                    {t("hero.titleLine2")}
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-foreground/95 dark:text-white/95 max-w-2xl mx-auto lg:mx-0 [text-shadow:0_1px_16px_rgba(255,255,255,0.5)] dark:[text-shadow:0_1px_18px_rgba(0,0,0,0.7),0_1px_3px_rgba(0,0,0,0.6)]">
                  {t("hero.subtitle")}
                </p>
              </div>
              <HeroSearch />
            </div>

            {/* Scaled-down project artwork — its own clear zone for reading */}
            <HeroSlider />
          </div>
        </div>
      </section>

      {/* ===== Trusted Development Partners (Mount City + Mount Agiba) ===== */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-secondary font-semibold mb-3">
              <BadgeCheck className="h-4 w-4" /> {t("partnerDevelopers.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {t("partnerDevelopers.heading")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("partnerDevelopers.subheading")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {(
              [
                {
                  key: "mountCity",
                  Icon: Mountain,
                  ownerKey: "rooya",
                  // Keep Mount City physically on the RIGHT and Agiba on the LEFT in both languages
                  order: isRtl ? "md:order-1" : "md:order-2",
                  images: [
                    {
                      src: partnerMountCity,
                      alt: t("partnerDevelopers.mountCity.image1Alt"),
                      caption: t("partnerDevelopers.mountCity.image1Caption"),
                    },
                  ],
                },
                {
                  key: "mountAgiba",
                  Icon: TreePine,
                  ownerKey: "royal",
                  order: isRtl ? "md:order-2" : "md:order-1",
                  images: [
                    {
                      src: partnerMountAgiba,
                      alt: t("partnerDevelopers.mountAgiba.image1Alt"),
                      caption: t("partnerDevelopers.mountAgiba.image1Caption"),
                    },
                  ],
                },
              ] as const
            ).map((dev) => (
              <article
                key={dev.key}
                className={`rounded-3xl bg-card shadow-soft hover:shadow-elegant transition-all overflow-hidden ${dev.order}`}
              >
                {/* Full-width land photo as the card's visible background */}
                <div>
                  {dev.images.map((img) => (
                    <figure key={img.caption} className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={img.src}
                        alt={img.alt}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                      />
                      <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent text-white text-xs font-medium px-3 py-2">
                        {img.caption}
                      </figcaption>
                    </figure>
                  ))}
                </div>

                <div className="p-6 md:p-7">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1 mb-3">
                    <BadgeCheck className="h-3.5 w-3.5" />{" "}
                    {t("partnerDevelopers.verifiedOwner", {
                      owner: t(`partnerDevelopers.owners.${dev.ownerKey}`),
                    })}
                  </span>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <dev.Icon className="h-5 w-5 text-secondary" />{" "}
                    {t(`partnerDevelopers.${dev.key}.name`)}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    {t(`partnerDevelopers.${dev.key}.owner`)}
                  </p>
                  <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">
                    {t(`partnerDevelopers.${dev.key}.desc`)}
                  </p>

                  <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-border pt-4">
                    {(
                      [
                        ["location", MapPin],
                        ["type", Landmark],
                        ["area", Maximize],
                        ["price", Wallet],
                        ["payment", Clock],
                        ["status", Shield],
                      ] as const
                    ).map(([field, Icon]) => (
                      <div key={field} className="flex items-start gap-2">
                        <Icon className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                        <div>
                          <dt className="sr-only">{field}</dt>
                          {/* "|"-separated locale values render as stacked lines (e.g. price + per-meter) */}
                          {t(`partnerDevelopers.${dev.key}.details.${field}`)
                            .split("|")
                            .map((line) => (
                              <dd key={line} className="text-muted-foreground leading-snug">
                                {line}
                              </dd>
                            ))}
                        </div>
                      </div>
                    ))}
                  </dl>

                  <Button variant="brand" className="mt-6" asChild>
                    <Link to="/properties">
                      {t("partnerDevelopers.explore")} <ArrowRight className="ml-1" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Property Types — 8 cards, 2 photos each ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("propertyTypes.heading")}</h2>
          <p className="text-muted-foreground text-lg">{t("propertyTypes.subheading")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TYPE_CARDS.map((pt) => (
            <Link
              key={pt.key}
              to="/property-types"
              className="group rounded-2xl bg-card overflow-hidden shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <div className="grid grid-cols-2 h-36">
                {pt.images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={t(`propertyTypes.${pt.key}.title`)}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ))}
              </div>
              <div className="p-5">
                <div className="h-11 w-11 rounded-xl bg-brand-gradient flex items-center justify-center mb-3 shadow-glow">
                  <pt.Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-1.5">
                  {t(`propertyTypes.${pt.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {t(`propertyTypes.${pt.key}.desc`)}
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-secondary font-medium text-sm">
                  {t("propertyTypes.explore")}{" "}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== Price Trend ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2">
            <span className="inline-flex items-center gap-2 text-secondary font-semibold mb-3">
              <TrendingUp className="h-4 w-4" /> {t("trend.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("trend.heading")}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{t("trend.subheading")}</p>
          </div>
          <div className="lg:col-span-3">
            <PriceTrend />
          </div>
        </div>
      </section>

      {/* ===== Budget Planner ===== */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-secondary font-semibold mb-3">
              <Wallet className="h-4 w-4" /> {t("budget.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("budget.heading")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("budget.subheading")}
            </p>
          </div>
          <BudgetPlanner properties={featured} />
        </div>
      </section>

      {/* ===== Featured Properties ===== */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">{t("featured.heading")}</h2>
              <p className="text-muted-foreground mt-2">{t("featured.subheading")}</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link to="/properties">
                {t("featured.viewAll")} <ArrowRight />
              </Link>
            </Button>
          </div>

          {featured.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground mb-4">{t("featured.empty")}</p>
              <Button variant="brand" asChild>
                <Link to="/admin">{t("featured.addFirst")}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  isFavorite={favIds.has(p.id)}
                  onFavoriteChange={(v) => {
                    setFavIds((prev) => {
                      const n = new Set(prev);
                      v ? n.add(p.id) : n.delete(p.id);
                      return n;
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== Broker Packages ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-secondary font-semibold mb-3">
            <Sparkles className="h-4 w-4" /> {t("packages.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("packages.heading")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("packages.subheading")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* 7-day free */}
          <PackageCard
            name={t("packages.freePkg.name")}
            tagline={t("packages.freePkg.tagline")}
            price={t("packages.free")}
            priceNote={t("packages.trialNote")}
            features={[
              "websiteFeatured7",
              "socialPromo",
              "oneListing",
              "smartFilter",
              "contactButtons",
              "fullQuality",
            ]}
            t={t}
            ctaLabel={t("packages.ctaTrial")}
            ctaTo="/consultation"
          />

          {/* 3-month */}
          <PackageCard
            highlighted
            name={t("packages.quarterlyPkg.name")}
            tagline={t("packages.quarterlyPkg.tagline")}
            price="600 EGP"
            priceNote={t("packages.oneTime")}
            features={[
              "websiteFeatured3",
              "socialPromo",
              "fiveListings",
              "priorityPlacement",
              "smartFilter",
              "insights",
              "contactButtons",
            ]}
            t={t}
            ctaLabel={t("packages.cta")}
            ctaTo="/consultation"
            badge={t("packages.popularBadge")}
          />

          {/* 6-month */}
          <PackageCard
            name={t("packages.semiAnnualPkg.name")}
            tagline={t("packages.semiAnnualPkg.tagline")}
            price="1600 EGP"
            priceNote={t("packages.oneTime")}
            features={[
              "websiteFeatured6",
              "socialPromo",
              "fifteenListings",
              "topPlacement",
              "advancedFilter",
              "fullInsights",
              "contactButtons",
              "dedicatedSupport",
            ]}
            t={t}
            ctaLabel={t("packages.cta")}
            ctaTo="/consultation"
          />
        </div>
      </section>

      {/* ===== Property Gallery ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("gallery.heading")}</h2>
          <p className="text-muted-foreground text-lg">{t("gallery.subheading")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(
            [
              {
                src: mountCitySea,
                alt: t("partnerDevelopers.mountCity.image1Alt"),
                caption: t("partnerDevelopers.mountCity.image1Caption"),
              },
              {
                src: mountCityDev,
                alt: t("partnerDevelopers.mountCity.image2Alt"),
                caption: t("partnerDevelopers.mountCity.image2Caption"),
              },
              {
                src: mountAgibaResort,
                alt: t("partnerDevelopers.mountAgiba.image1Alt"),
                caption: t("partnerDevelopers.mountAgiba.image1Caption"),
              },
              {
                src: mountAgibaSea,
                alt: t("partnerDevelopers.mountAgiba.image2Alt"),
                caption: t("partnerDevelopers.mountAgiba.image2Caption"),
              },
            ] as const
          ).map((g) => (
            <Link
              key={g.caption}
              to="/gallery"
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-soft hover:shadow-elegant transition-all"
            >
              <img
                src={g.src}
                alt={g.alt}
                loading="lazy"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute bottom-3 inset-x-3 text-white text-sm font-medium">
                {g.caption}
              </span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/gallery">
              {t("gallery.openGallery")} <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      {/* ===== Free Consultation CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-brand-gradient p-12 md:p-16 text-center shadow-elegant">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("cta.heading")}</h2>
          <p className="text-white/85 text-lg mb-8 max-w-2xl mx-auto">{t("cta.subheading")}</p>
          <Button variant="accent" size="xl" asChild>
            <Link to="/consultation">
              {t("cta.book")} <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

/* ---------- Package card ---------- */

const PACKAGE_FEATURES: Record<string, { key: string; icon: typeof Globe }> = {
  websiteFeatured7: { key: "websiteFeatured7", icon: Globe },
  websiteFeatured3: { key: "websiteFeatured3", icon: Globe },
  websiteFeatured6: { key: "websiteFeatured6", icon: Globe },
  socialPromo: { key: "socialPromo", icon: Users },
  oneListing: { key: "oneListing", icon: HomeIcon },
  fiveListings: { key: "fiveListings", icon: HomeIcon },
  fifteenListings: { key: "fifteenListings", icon: HomeIcon },
  priorityPlacement: { key: "priorityPlacement", icon: TrendingUp },
  topPlacement: { key: "topPlacement", icon: TrendingUp },
  smartFilter: { key: "smartFilter", icon: Filter },
  advancedFilter: { key: "advancedFilter", icon: Filter },
  insights: { key: "insights", icon: TrendingUp },
  fullInsights: { key: "fullInsights", icon: TrendingUp },
  contactButtons: { key: "contactButtons", icon: Phone },
  dedicatedSupport: { key: "dedicatedSupport", icon: Shield },
  fullQuality: { key: "fullQuality", icon: Sparkles },
};

type HomeT = (key: string, opts?: Record<string, unknown>) => string;

function PackageCard({
  name,
  tagline,
  price,
  priceNote,
  features,
  t,
  ctaLabel,
  ctaTo,
  highlighted,
  badge,
}: {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  features: string[];
  t: HomeT;
  ctaLabel: string;
  ctaTo: string;
  highlighted?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`relative rounded-3xl p-8 flex flex-col transition-all hover:-translate-y-1 ${
        highlighted
          ? "bg-brand-gradient text-white shadow-elegant ring-2 ring-secondary"
          : "bg-card shadow-soft hover:shadow-elegant"
      }`}
    >
      {badge && (
        <span className="absolute -top-3.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-soft whitespace-nowrap">
          {badge}
        </span>
      )}
      <h3 className={`text-xl font-bold mb-1.5 ${highlighted ? "text-white" : ""}`}>{name}</h3>
      <p className={`text-sm mb-5 ${highlighted ? "text-white/80" : "text-muted-foreground"}`}>
        {tagline}
      </p>
      <div className="mb-6">
        <span className={`text-4xl font-bold ${highlighted ? "text-white" : "text-primary"}`}>
          {price}
        </span>{" "}
        <span className={`text-sm ${highlighted ? "text-white/75" : "text-muted-foreground"}`}>
          {priceNote}
        </span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => {
          const meta = PACKAGE_FEATURES[f];
          return (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              {meta && (
                <meta.icon
                  className={`h-4 w-4 mt-0.5 shrink-0 ${highlighted ? "text-accent" : "text-secondary"}`}
                />
              )}
              <span className={highlighted ? "text-white/90" : "text-muted-foreground"}>
                {t(`packages.features.${f}`)}
              </span>
            </li>
          );
        })}
      </ul>
      <Link
        to={ctaTo}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all ${
          highlighted
            ? "bg-accent text-accent-foreground hover:bg-accent/90"
            : "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/90"
        }`}
      >
        {ctaLabel} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
