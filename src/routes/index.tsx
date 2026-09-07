import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  HardHat,
  MapPin,
  Search,
  TrendingUp,
  Sparkles,
  Shield,
  Zap,
  Building2,
  Home as HomeIcon,
  Warehouse,
  Brain,
  Users,
  Clock,
  PiggyBank,
  Smile,
  Target,
  Eye,
  Rocket,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyTypesShowcaseGrid } from "@/components/PropertyTypeShowcase";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import heroImg from "@/assets/hero-villa.jpg";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

const CITIES = ["fifthSettlement", "sheikhZayed", "northCoast", "giza", "cairo", "newCapital", "sixOctober"] as const;
const DEVELOPERS = [
  "Rooya Real Estate Investment",
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
  const navigate = useNavigate();
  const { user } = useAuth();

  const runSearch = () =>
    navigate({
      to: "/properties",
      search: {
        type: "all",
        q: city === "all" ? "" : t(`hero.search.cities.${city}`),
        beds: "any",
        sort: "featured",
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
        <div className="absolute inset-0 opacity-30">
          <img src={heroImg} alt="" className="h-full w-full object-cover" width={1920} height={1280} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 text-accent" /> {t("hero.badge")}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance leading-tight">
              {t("hero.titleLine1")}{" "}
              <span className="font-display text-accent">{t("hero.titleLine2")}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Advanced search bar */}
          <div className="max-w-3xl mx-auto rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-5 shadow-elegant">
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
            <div className="flex flex-wrap justify-center gap-3 mt-5">
              <Button variant="outlineHero" size="sm" asChild>
                <Link to="/properties">{t("hero.browseProperties")} <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button variant="outlineHero" size="sm" asChild>
                <Link to="/consultation"><HardHat className="h-4 w-4" /> {t("hero.freeConsultation")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending properties + partner developers */}
      <section className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold inline-flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" /> {t("trending.heading")}
            </h2>
            <Link to="/properties" className="text-sm text-secondary font-medium inline-flex items-center gap-1 hover:underline">
              {t("trending.viewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
              {featured.map((p) => (
                <Link
                  key={p.id}
                  to="/properties/$id"
                  params={{ id: p.id }}
                  className="snap-start shrink-0 w-64 rounded-2xl overflow-hidden bg-card shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all group"
                >
                  <div className="h-36 overflow-hidden">
                    <img
                      src={p.image_urls?.[0] || heroImg}
                      alt={p.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{p.location}</p>
                    <p className="text-secondary font-bold mt-1.5">
                      {Number(p.price).toLocaleString()} {p.currency}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{t("featured.empty")}</p>
          )}
        </div>
        <div className="border-t bg-muted/30 py-5 overflow-hidden">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-4">
            {t("partners.heading")}
          </p>
          <div className="flex w-max animate-marquee gap-14 px-6">
            {[...DEVELOPERS, ...DEVELOPERS].map((d, i) => (
              <span key={i} className="text-lg md:text-xl font-display font-semibold text-muted-foreground/70 whitespace-nowrap">
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { key: "curated", icon: Sparkles },
            { key: "trusted", icon: Shield },
            { key: "fast", icon: Zap },
          ].map((f) => (
            <div key={f.key} className="rounded-2xl bg-card p-8 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-brand-gradient flex items-center justify-center mb-4 shadow-glow">
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t(`valueProps.${f.key}.title`)}</h3>
              <p className="text-muted-foreground">{t(`valueProps.${f.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who We Are */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-secondary font-semibold mb-3">
              <Zap className="h-4 w-4" /> {t("whoWeAre.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-5">
              {t("whoWeAre.titlePrefix")} <span className="text-secondary">{t("whoWeAre.titleHighlight")}</span>.
            </h2>
            <p
              className="text-muted-foreground text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t("whoWeAre.description") }}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: "goal", icon: Target },
              { key: "vision", icon: Eye },
              { key: "futureVision", icon: Rocket },
              { key: "aspiration", icon: Sparkles },
            ].map((c) => (
              <div key={c.key} className="rounded-2xl bg-card p-6 shadow-soft hover:shadow-elegant transition-all">
                <c.icon className="h-7 w-7 text-secondary mb-3" />
                <h3 className="font-semibold mb-1.5">{t(`whoWeAre.${c.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`whoWeAre.${c.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("propertyTypes.heading")}</h2>
            <p className="text-muted-foreground text-lg">{t("propertyTypes.subheading")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { key: "villas", icon: Building2 },
              { key: "apartments", icon: HomeIcon },
              { key: "commercial", icon: Warehouse },
            ].map((pt) => (
              <Link
                key={pt.key}
                to="/property-types"
                className="group rounded-2xl bg-card p-8 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1"
              >
                <div className="h-14 w-14 rounded-2xl bg-brand-gradient flex items-center justify-center mb-5 shadow-glow group-hover:scale-110 transition-transform">
                  <pt.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-xl mb-2">{t(`propertyTypes.${pt.key}.title`)}</h3>
                <p className="text-muted-foreground">{t(`propertyTypes.${pt.key}.desc`)}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-secondary font-medium text-sm">
                  {t("propertyTypes.explore")} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Property Gallery teaser */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">{t("gallery.heading")}</h2>
            <p className="text-muted-foreground mt-2">{t("gallery.subheading")}</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/gallery">{t("gallery.openGallery")} <ArrowRight /></Link>
          </Button>
        </div>
      </section>

      {/* Property Types showcase — shared with /property-types */}
      <section className="bg-muted/20 border-y py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 text-secondary font-semibold text-sm uppercase tracking-wider">
              {tPT("showcase.eyebrow")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-3">{tPT("showcase.title")}</h2>
            <p className="text-muted-foreground text-lg">{tPT("showcase.subtitle")}</p>
          </div>
          <PropertyTypesShowcaseGrid />
        </div>
      </section>

      {/* Featured properties */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">{t("featured.heading")}</h2>
            <p className="text-muted-foreground mt-2">{t("featured.subheading")}</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link to="/properties">{t("featured.viewAll")} <ArrowRight /></Link>
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
      </section>


      {/* Why Choose Us */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("whyChooseUs.heading")}</h2>
            <p className="text-muted-foreground text-lg">
              {t("whyChooseUs.subheading")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {[
              { key: "technology", icon: Brain },
              { key: "humanSupport", icon: Users },
              { key: "saveTime", icon: Clock },
              { key: "saveMoney", icon: PiggyBank },
              { key: "uniqueExperience", icon: Smile },
              { key: "verifiedListings", icon: Sparkles },
            ].map((f) => (
              <div key={f.key} className="rounded-2xl bg-card p-6 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1">
                <f.icon className="h-7 w-7 text-secondary mb-3" />
                <h3 className="font-semibold mb-1.5">{t(`whyChooseUs.${f.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`whyChooseUs.${f.key}.desc`)}</p>
              </div>
            ))}
          </div>

          <blockquote className="max-w-3xl mx-auto text-center text-lg md:text-xl italic text-foreground/80 border-l-4 border-secondary pl-6 py-2">
            {t("whyChooseUs.quote")}
          </blockquote>
        </div>
      </section>

      {/* Free Consultation CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-brand-gradient p-12 md:p-16 text-center shadow-elegant">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("cta.heading")}</h2>
          <p className="text-white/85 text-lg mb-8 max-w-2xl mx-auto">
            {t("cta.subheading")}
          </p>
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
