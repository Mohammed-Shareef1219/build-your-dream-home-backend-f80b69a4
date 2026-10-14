import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  HardHat,
  MapPin,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyTypesShowcaseGrid } from "@/components/PropertyTypeShowcase";
import { PricingPackages } from "@/components/PricingPackages";
import { PriceTrend } from "@/components/PriceTrend";
import { BudgetPlanner } from "@/components/BudgetPlanner";
import { HeroShowcase } from "@/components/HeroShowcase";
import { AdSlot } from "@/components/AdSlot";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import heroImg from "@/assets/hero-home.jpg";
import montCity4Img from "@/assets/mont-city-4.png";
import mountAgiba7Img from "@/assets/mount-agiba-7.png";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

const CITIES = [
  "fifthSettlement",
  "sheikhZayed",
  "sixOctober",
  "giza",
  "nasrCity",
  "heliopolis",
  "oldCairo",
  "mohandessin",
  "marsaMatrouh",
  "northCoast",
  "cairo",
  "newCapital",
] as const;
const BUDGETS = ["any", "under300", "300to700", "700to1500", "over1500"] as const;
const POPULAR = ["villa", "apartment", "duplex", "studio", "country_house", "smart_home"] as const;
const DEVELOPERS = [
  "Rooya Al-Mustaqbal Real Estate Investment Company",
  "Ebn Beitak",
  "Palm Hills Developments",
  "SODIC",
  "Emaar Misr",
  "Tatweer Misr",
  "Mountain View",
  "Talaat Moustafa Group",
];


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

function IndexPage() {
  const { t } = useTranslation("home");
  const { t: tPT } = useTranslation("propertyTypes");
  const [featured, setFeatured] = useState<Property[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [deal, setDeal] = useState<"sale" | "rent">("sale");
  const [category, setCategory] = useState<"residential" | "commercial">("residential");
  const [city, setCity] = useState<string>("all");
  const [budget, setBudget] = useState<string>("any");
  const [subTab, setSubTab] = useState<"popular" | "developers">("popular");
  const navigate = useNavigate();
  const { user } = useAuth();

  const runSearch = () =>
    navigate({
      to: "/properties",
      search: {
        type: "all",
        q: city === "all" ? "" : t(`hero.search.cities.${city}`),
        beds: "any",
        sort: budget === "over1500" ? "price_desc" : budget === "under300" ? "price_asc" : "featured",
        deal,
        category,
      },
    });

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10)
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient text-white">
        <div className="absolute inset-0 opacity-40">
          <img src={heroImg} alt="" className="h-full w-full object-cover" width={1920} height={1080} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: text + search */}
            <div className="text-center lg:text-start">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4 text-accent" /> {t("hero.badge")}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance leading-tight">
                {t("hero.titleLine1")}{" "}
                <span className="font-display text-accent">{t("hero.titleLine2")}</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto lg:mx-0">
                {t("hero.subtitle")}
              </p>

              {/* Advanced search bar */}
              <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-5 shadow-elegant text-start">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="inline-flex rounded-full bg-black/25 p-1" role="group" aria-label={t("hero.search.dealLabel")}>
                    {(["sale", "rent"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDeal(d)}
                        className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all ${
                          deal === d ? "bg-accent text-accent-foreground shadow" : "text-white/70 hover:text-white"
                        }`}
                      >
                        {t(`hero.search.${d}`)}
                      </button>
                    ))}
                  </div>
                  <div className="inline-flex rounded-full bg-black/25 p-1" role="group" aria-label={t("hero.search.categoryLabel")}>
                    {(["residential", "commercial"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all ${
                          category === c ? "bg-accent text-accent-foreground shadow" : "text-white/70 hover:text-white"
                        }`}
                      >
                        {t(`hero.search.${c}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <MapPin className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 pointer-events-none" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      aria-label={t("hero.search.cityLabel")}
                      className="w-full h-12 appearance-none rounded-xl bg-black/25 border border-white/20 ps-10 pe-10 text-sm text-white focus:outline-none focus:border-accent [&>option]:text-foreground"
                    >
                      <option value="all">{t("hero.search.allCities")}</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{t(`hero.search.cities.${c}`)}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute end-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 pointer-events-none" />
                  </div>
                  <Button variant="accent" size="lg" onClick={runSearch} className="h-12 px-8">
                    <Search /> {t("hero.search.button")}
                  </Button>
                </div>
                {/* Budget filter */}
                <div className="relative mt-3">
                  <Wallet className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 pointer-events-none" />
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    aria-label={t("hero.search.budgetLabel")}
                    className="w-full h-12 appearance-none rounded-xl bg-black/25 border border-white/20 ps-10 pe-10 text-sm text-white focus:outline-none focus:border-accent [&>option]:text-foreground"
                  >
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>{t(`hero.search.budgets.${b}`)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute end-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 pointer-events-none" />
                </div>
                {/* Subcategories inside the search */}
                <div className="mt-4 border-t border-white/15 pt-4">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                    {(["popular", "developers"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSubTab(tab)}
                        className={`rounded-full px-4 py-1 text-xs font-semibold transition-all ${
                          subTab === tab ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                        }`}
                      >
                        {t(`hero.search.sub.${tab}`)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 snap-x no-scrollbar">
                    {subTab === "popular"
                      ? POPULAR.map((typeKey) => (
                          <Link
                            key={typeKey}
                            to="/properties"
                            search={{ type: typeKey, q: "", beds: "any", sort: "featured", deal, category }}
                            className="snap-start shrink-0 rounded-full border border-white/25 bg-white/5 px-4 py-1.5 text-xs text-white/85 hover:bg-white/15 transition-colors whitespace-nowrap"
                          >
                            {t(`hero.search.types.${typeKey}`)}
                          </Link>
                        ))
                      : DEVELOPERS.map((d) => (
                          <Link
                            key={d}
                            to="/property-types"
                            className="snap-start shrink-0 rounded-full border border-white/25 bg-white/5 px-4 py-1.5 text-xs text-white/85 hover:bg-white/15 transition-colors whitespace-nowrap"
                          >
                            {d}
                          </Link>
                        ))}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">
                  <Button variant="outlineHero" size="sm" asChild>
                    <Link to="/properties">{t("hero.browseProperties")} <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                  <Button variant="outlineHero" size="sm" asChild>
                    <Link to="/consultation"><HardHat className="h-4 w-4" /> {t("hero.freeConsultation")}</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: moving-image showcase */}
            <HeroShowcase />
          </div>
        </div>
      </section>

      {/* Trusted Development Partners */}
      <section className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-secondary font-semibold text-sm uppercase tracking-wider">
              <BadgeCheck className="h-4 w-4" /> {t("trustedPartners.partner")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">{t("trustedPartners.heading")}</h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">{t("trustedPartners.sub")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Monte City */}
            <article className="group rounded-3xl overflow-hidden bg-card shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                <img
                  src={montCity4Img}
                  alt={t("trustedPartners.montCity.title")}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  width={800}
                  height={450}
                />
                <span className="absolute top-4 start-4 bg-accent text-accent-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-soft">
                  {t("trustedPartners.montCity.status")}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold">{t("trustedPartners.montCity.title")}</h3>
                <p className="mt-1.5 text-sm text-secondary font-medium">{t("trustedPartners.ownerLine")}</p>
                <p className="mt-3 text-muted-foreground leading-relaxed">{t("trustedPartners.montCity.desc")}</p>
                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div><dt className="inline text-muted-foreground">{t("trustedPartners.labels.location")}: </dt><dd className="inline font-medium">{t("trustedPartners.montCity.location")}</dd></div>
                  <div><dt className="inline text-muted-foreground">{t("trustedPartners.labels.type")}: </dt><dd className="inline font-medium">{t("trustedPartners.montCity.type")}</dd></div>
                  <div><dt className="inline text-muted-foreground">{t("trustedPartners.labels.area")}: </dt><dd className="inline font-medium">{t("trustedPartners.montCity.area")}</dd></div>
                  <div><dt className="inline text-muted-foreground">{t("trustedPartners.labels.price")}: </dt><dd className="inline font-medium">{t("trustedPartners.montCity.price")}</dd></div>
                  <div className="sm:col-span-2"><dt className="inline text-muted-foreground">{t("trustedPartners.labels.payment")}: </dt><dd className="inline font-medium">{t("trustedPartners.montCity.payment")}</dd></div>
                  <div className="sm:col-span-2"><dt className="inline text-muted-foreground">{t("trustedPartners.labels.status")}: </dt><dd className="inline font-medium">{t("trustedPartners.montCity.status")}</dd></div>
                </dl>
                <div className="mt-6">
                  <Button variant="brand" asChild>
                    <Link to="/catalog/$slug/$code" params={{ slug: "land", code: "IB-2026-A1" }}>
                      {t("trustedPartners.cta")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>

            {/* Monte Agiba Resort */}
            <article className="group rounded-3xl overflow-hidden bg-card shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                <img
                  src={mountAgiba7Img}
                  alt={t("trustedPartners.mountAgiba.title")}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  width={800}
                  height={450}
                />
                <span className="absolute top-4 start-4 bg-accent text-accent-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-soft">
                  {t("trustedPartners.mountAgiba.status")}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold">{t("trustedPartners.mountAgiba.title")}</h3>
                <p className="mt-1.5 text-sm text-secondary font-medium">{t("trustedPartners.ownerLine")}</p>
                <p className="mt-3 text-muted-foreground leading-relaxed">{t("trustedPartners.mountAgiba.desc")}</p>
                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div><dt className="inline text-muted-foreground">{t("trustedPartners.labels.location")}: </dt><dd className="inline font-medium">{t("trustedPartners.mountAgiba.location")}</dd></div>
                  <div><dt className="inline text-muted-foreground">{t("trustedPartners.labels.type")}: </dt><dd className="inline font-medium">{t("trustedPartners.mountAgiba.type")}</dd></div>
                  <div><dt className="inline text-muted-foreground">{t("trustedPartners.labels.area")}: </dt><dd className="inline font-medium">{t("trustedPartners.mountAgiba.area")}</dd></div>
                  <div><dt className="inline text-muted-foreground">{t("trustedPartners.labels.price")}: </dt><dd className="inline font-medium">{t("trustedPartners.mountAgiba.price")}</dd></div>
                  <div className="sm:col-span-2"><dt className="inline text-muted-foreground">{t("trustedPartners.labels.payment")}: </dt><dd className="inline font-medium">{t("trustedPartners.mountAgiba.payment")}</dd></div>
                  <div className="sm:col-span-2"><dt className="inline text-muted-foreground">{t("trustedPartners.labels.status")}: </dt><dd className="inline font-medium">{t("trustedPartners.mountAgiba.status")}</dd></div>
                </dl>
                <div className="mt-6">
                  <Button variant="brand" asChild>
                    <Link to="/catalog/$slug/$code" params={{ slug: "land", code: "IB-2026-A2" }}>
                      {t("trustedPartners.cta")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Property Gallery */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">{t("gallery.heading")}</h2>
            <p className="text-muted-foreground mt-2">{t("gallery.subheading")}</p>
          </div>
          <Button size="lg" asChild>
            <Link to="/gallery">
              {t("gallery.openGallery")} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <PropertyTypesShowcaseGrid />
      </section>

      {/* Packages */}
      <PricingPackages />

      {/* Market price trend */}
      <PriceTrend />

      {/* Budget planner */}
      <BudgetPlanner />

      {/* Featured properties */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">{t("featured.heading")}</h2>
            <p className="text-muted-foreground mt-2">{t("featured.subheading")}</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/properties">
              {t("featured.viewAll")} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {featured.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((p) => (
              <PropertyCard key={p.id} property={p} isFavorite={favIds.has(p.id)} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground mb-4">{t("featured.empty")}</p>
            <Button asChild>
              <Link to="/add-property">{t("featured.addFirst")}</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Free Consultation CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-brand-gradient p-12 md:p-16 text-center shadow-elegant">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("cta.heading")}</h2>
          <p className="text-white/85 text-lg mb-8 max-w-2xl mx-auto">{t("cta.subheading")}</p>
          <Button variant="accent" size="lg" asChild>
            <Link to="/consultation">
              <HardHat className="h-5 w-5" /> {t("cta.book")}
            </Link>
          </Button>
        </div>
      </section>

      {/* Dynamic ad slot */}
      <AdSlot />
    </>
  );
}
