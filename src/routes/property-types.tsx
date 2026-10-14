import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Building2,
  Home,
  Layers,
  Trees,
  Square,
  Cpu,
  Sparkles,
  TrendingUp,
  Sun,
  Ruler,
  Users,
  Wallet,
  CheckCircle2,
  Calculator,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PropertyTypesShowcaseGrid } from "@/components/PropertyTypeShowcase";
import { HERO_CAROUSEL } from "@/components/PropertyTypesHeroCarousel";

export const Route = createFileRoute("/property-types")({
  head: () => ({
    meta: [
      { title: "Property Types — Architectural Consultant | BuildYourHome" },
      {
        name: "description",
        content:
          "Smart property matchmaking: compare villas, apartments, duplexes & studios by cost, ROI, sustainability and family fit. Floor plans + budget calculator.",
      },
      { property: "og:title", content: "Property Types — Architectural Consultant" },
      {
        property: "og:description",
        content:
          "Find the right structural design for your land, budget and lifestyle — backed by investment & sustainability insight.",
      },
    ],
  }),
  component: PropertyTypesPage,
});

/* ---------------- Data ---------------- */

type TypeKey = "villa" | "apartment" | "duplex" | "country_house" | "studio" | "smart_home";

interface PropertyType {
  slug: TypeKey;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  startingPrice: number; // EGP
  pricePerSqm: number;
  minSize: number;
  idealFamily: string;
  maintenance: "Low" | "Medium" | "High";
  roi: number; // % yearly
  appreciation: number; // % yearly
  rentYield: number; // %
  liquidity: "High" | "Medium" | "Low";
  spaceTrick: string;
  floorPlanZones: { label: string; pct: number; color: string }[];
}

/** Deterministic pseudo-random generator — same seed = same "varying" data for all visitors of a 48h window. */
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** 48-hour epoch (in ms) so data shifts at a stable, predictable cadence. */
function currentWindowMs() {
  return Math.floor(Date.now() / (48 * 60 * 60 * 1000)) * 48 * 60 * 60 * 1000;
}

interface MarketRow {
  slug: TypeKey | "land";
  startingPrice: number;
  minSize: number;
  landRow: boolean;
  rentYield: number; // 0 = not applicable (land plots)
  maintenance: "Low" | "Medium" | "High";
}

/**
 * Market snapshot: refreshes every 48 hours. Within a window every visitor
 * sees the same values; across windows they vary — so the "Compare types
 * side-by-side" table stays fresh without a backend. Includes a single
 * aggregated "Land Plots" row (Mont City / Mount Agiba are NOT listed as
 * separate named rows).
 */
function useMarketSnapshot() {
  return useMemo((): MarketRow[] => {
    const windowMs = currentWindowMs();
    const rand = seededRandom(windowMs / 48 / 60000); // stable per 48h
    const drift = (rnd: number, span: number) => (rnd - 0.5) * span;

    const rows: MarketRow[] = TYPES.map((tp) => ({
      slug: tp.slug,
      startingPrice: Math.max(
        50_000,
        Math.round((tp.startingPrice * (1 + drift(rand(), 0.18))) / 5000) * 5000,
      ),
      minSize: tp.minSize,
      landRow: false,
      rentYield: Math.max(1, +(tp.rentYield + drift(rand(), 0.6)).toFixed(1)),
      maintenance: tp.maintenance,
    }));

    // Aggregated land row — generic "Land Plots" market line, no named projects.
    rows.push({
      slug: "land",
      startingPrice: Math.max(
        30_000,
        Math.round((40_000 * (1 + drift(rand(), 0.09))) / 1000) * 1000,
      ),
      minSize: 200,
      landRow: true,
      rentYield: 0,
      maintenance: "Low",
    });

    return rows;
  }, []);
}

const TYPES: PropertyType[] = [
  {
    slug: "studio",
    name: "Smart Studio",
    tagline: "Compact intelligence — every square meter earns its keep.",
    icon: Square,
    startingPrice: 180000,
    pricePerSqm: 6500,
    minSize: 28,
    idealFamily: "1 person",
    maintenance: "Low",
    roi: 9.2,
    appreciation: 4.5,
    rentYield: 7.8,
    liquidity: "High",
    spaceTrick: "Convertible furniture + mezzanine = 28m² feels like 42m².",
    floorPlanZones: [
      { label: "Living / Sleep", pct: 55, color: "var(--secondary)" },
      { label: "Kitchen", pct: 20, color: "var(--accent)" },
      { label: "Bath", pct: 15, color: "var(--primary-glow)" },
      { label: "Storage", pct: 10, color: "var(--muted-foreground)" },
    ],
  },
  {
    slug: "apartment",
    name: "Smart Apartment",
    tagline: "Vertical living, optimized for modern households.",
    icon: Building2,
    startingPrice: 250000,
    pricePerSqm: 5800,
    minSize: 75,
    idealFamily: "2–4 people",
    maintenance: "Low",
    roi: 7.5,
    appreciation: 5.2,
    rentYield: 6.4,
    liquidity: "High",
    spaceTrick: "Open-plan + concealed storage walls turn 100m² into perceived 130m².",
    floorPlanZones: [
      { label: "Living / Dining", pct: 40, color: "var(--secondary)" },
      { label: "Bedrooms", pct: 35, color: "var(--primary-glow)" },
      { label: "Kitchen", pct: 15, color: "var(--accent)" },
      { label: "Bath / Utility", pct: 10, color: "var(--muted-foreground)" },
    ],
  },
  {
    slug: "duplex",
    name: "Duplex Design",
    tagline: "Two floors, one family — privacy by vertical zoning.",
    icon: Layers,
    startingPrice: 450000,
    pricePerSqm: 5200,
    minSize: 160,
    idealFamily: "4–6 people",
    maintenance: "Medium",
    roi: 6.8,
    appreciation: 5.8,
    rentYield: 5.5,
    liquidity: "Medium",
    spaceTrick: "Stairwell as light-well doubles daylight reach across both floors.",
    floorPlanZones: [
      { label: "Ground Social", pct: 45, color: "var(--secondary)" },
      { label: "Upper Private", pct: 40, color: "var(--primary-glow)" },
      { label: "Service Core", pct: 15, color: "var(--muted-foreground)" },
    ],
  },
  {
    slug: "villa",
    name: "Luxury Villa",
    tagline: "Detached freedom — land, garden, full architectural control.",
    icon: Home,
    startingPrice: 1200000,
    pricePerSqm: 4800,
    minSize: 280,
    idealFamily: "5–8 people",
    maintenance: "High",
    roi: 5.5,
    appreciation: 6.5,
    rentYield: 4.2,
    liquidity: "Medium",
    spaceTrick: "Courtyard plan cools internal rooms passively, reducing AC by ~30%.",
    floorPlanZones: [
      { label: "Living / Majlis", pct: 35, color: "var(--secondary)" },
      { label: "Bedrooms", pct: 30, color: "var(--primary-glow)" },
      { label: "Garden / Court", pct: 20, color: "var(--accent)" },
      { label: "Service", pct: 15, color: "var(--muted-foreground)" },
    ],
  },
  {
    slug: "country_house",
    name: "Country House",
    tagline: "Off-grid sensibility, rooted in landscape.",
    icon: Trees,
    startingPrice: 350000,
    pricePerSqm: 4200,
    minSize: 180,
    idealFamily: "3–6 people",
    maintenance: "Medium",
    roi: 5.0,
    appreciation: 4.8,
    rentYield: 4.0,
    liquidity: "Low",
    spaceTrick: "Deep verandas extend living space outdoors 6 months a year.",
    floorPlanZones: [
      { label: "Indoor Living", pct: 50, color: "var(--secondary)" },
      { label: "Veranda / Outdoor", pct: 25, color: "var(--accent)" },
      { label: "Bedrooms", pct: 20, color: "var(--primary-glow)" },
      { label: "Service", pct: 5, color: "var(--muted-foreground)" },
    ],
  },
  {
    slug: "smart_home",
    name: "Fully Smart Home",
    tagline: "AI-orchestrated comfort — the building thinks with you.",
    icon: Cpu,
    startingPrice: 650000,
    pricePerSqm: 6200,
    minSize: 140,
    idealFamily: "2–5 people",
    maintenance: "Low",
    roi: 8.0,
    appreciation: 7.0,
    rentYield: 6.0,
    liquidity: "High",
    spaceTrick: "Sensor-driven lighting & motorized partitions adapt rooms by time of day.",
    floorPlanZones: [
      { label: "Adaptive Living", pct: 45, color: "var(--secondary)" },
      { label: "Smart Bedrooms", pct: 30, color: "var(--primary-glow)" },
      { label: "Tech Core", pct: 15, color: "var(--accent)" },
      { label: "Service", pct: 10, color: "var(--muted-foreground)" },
    ],
  },
];

/* ---------------- Page ---------------- */

function PropertyTypesPage() {
  return (
    <div className="bg-background">
      <Hero />
      <ConceptStrip />
      <ComparisonSection />
      <ShowcaseSection />
      <FloorPlansSection />
      <CalculatorSection />
      <CTASection />
    </div>
  );
}

/* ---------------- Sections ---------------- */

function Hero() {
  const { t } = useTranslation("propertyTypes");
  return (
    <section className="relative overflow-hidden bg-hero-gradient text-primary-foreground">
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />
      <HeroCarousel />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <Badge className="bg-accent text-accent-foreground hover:bg-accent mb-6">
          <Sparkles className="size-3.5 mr-1" /> {t("hero.badge")}
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold max-w-4xl text-balance leading-[1.05]">
          {t("hero.titlePart1")}{" "}
          <span className="font-display text-accent">{t("hero.titleHighlight")}</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
          {t("hero.subtitle")}
        </p>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
          {[
            { icon: Ruler, label: t("hero.features.spaceAnalysis") },
            { icon: TrendingUp, label: t("hero.features.investmentOutlook") },
            { icon: Sun, label: t("hero.features.sustainabilityBrief") },
            { icon: Calculator, label: t("hero.features.budgetCalculator") },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur px-3 py-2.5 text-sm"
            >
              <f.icon className="size-4 text-accent shrink-0" />
              <span className="text-primary-foreground/90">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Rotating property-type imagery — cycles every 5 seconds. */
function HeroCarousel() {
  const { t } = useTranslation("propertyTypes");
  const [index, setIndex] = useState(0);
  const current = HERO_CAROUSEL[index];

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_CAROUSEL.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {HERO_CAROUSEL.map((frame, i) => (
        <img
          key={frame.src}
          src={frame.src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-hero-gradient/60" />
      <div className="absolute bottom-6 left-8 flex items-center gap-1.5">
        {HERO_CAROUSEL.map((frame, i) => (
          <button
            key={frame.src}
            type="button"
            aria-label={t(`heroCarousel.${frame.labelKey}` as string)}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
        <span className="ms-3 text-xs font-medium text-white/90 bg-black/30 backdrop-blur px-3 py-1 rounded-full">
          {t(`heroCarousel.${current.labelKey}` as string)}
        </span>
      </div>
    </div>
  );
}

function ConceptStrip() {
  const { t } = useTranslation("propertyTypes");
  const items = [
    {
      icon: Ruler,
      title: t("conceptStrip.function.title"),
      body: t("conceptStrip.function.body"),
    },
    {
      icon: Sparkles,
      title: t("conceptStrip.feeling.title"),
      body: t("conceptStrip.feeling.body"),
    },
    {
      icon: TrendingUp,
      title: t("conceptStrip.future.title"),
      body: t("conceptStrip.future.body"),
    },
  ];
  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-3 gap-6">
        {items.map((i) => (
          <div key={i.title} className="flex gap-4">
            <div className="size-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <i.icon className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{i.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{i.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComparisonSection() {
  const { t } = useTranslation("propertyTypes");
  const market = useMarketSnapshot();
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <SectionHeader
        eyebrow={t("comparison.eyebrow")}
        title={t("comparison.title")}
        subtitle={t("comparison.subtitle")}
      />
      <div className="mt-10 overflow-x-auto rounded-2xl border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              {[
                t("comparison.headers.type"),
                t("comparison.headers.startsAt"),
                t("comparison.headers.minSize"),
                t("comparison.headers.familyFit"),
                t("comparison.headers.maintenance"),
                t("comparison.headers.rentYield"),
                t("comparison.headers.liquidity"),
              ].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {market.map((m) => {
              const isLand = m.landRow;
              const tp = isLand ? undefined : TYPES.find((x) => x.slug === m.slug)!;
              return (
                <tr key={m.slug} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                        {isLand ? (
                          <Trees className="size-4" />
                        ) : tp ? (
                          <tp.icon className="size-4" />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {isLand ? t("types.land.name") : t(`types.${tp!.slug}.name`)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isLand ? t("types.land.tagline") : t(`types.${tp!.slug}.tagline`)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium whitespace-nowrap">
                    {formatEGP(m.startingPrice)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{m.minSize} m²</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {isLand ? t("types.land.idealFamily") : t(`types.${tp!.slug}.idealFamily`)}
                  </td>
                  <td className="px-4 py-4">
                    <MaintenancePill
                      level={m.maintenance}
                      label={isLand ? t("land.maintenance") : t(`types.${tp!.slug}.maintenance`)}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap font-medium text-secondary">
                    {isLand ? "—" : `${m.rentYield}%`}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {isLand ? t("land.liquidity") : t(`types.${tp!.slug}.liquidity`)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground text-center">
        {t("comparison.refreshNote")}
      </p>
    </section>
  );
}

/* ---------------- Showcase (visual property type cards) ---------------- */

function ShowcaseSection() {
  const { t } = useTranslation("propertyTypes");
  return (
    <section className="bg-muted/20 border-y">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeader
          eyebrow={t("showcase.eyebrow")}
          title={t("showcase.title")}
          subtitle={t("showcase.subtitle")}
        />
        <PropertyTypesShowcaseGrid />
      </div>
    </section>
  );
}


function FloorPlansSection() {
  const { t } = useTranslation("propertyTypes");
  const [active, setActive] = useState<TypeKey>("apartment");
  const activeType = TYPES.find((x) => x.slug === active)!;
  return (
    <section className="bg-muted/30 border-y">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeader
          eyebrow={t("floorPlans.eyebrow")}
          title={t("floorPlans.title")}
          subtitle={t("floorPlans.subtitle")}
        />
        <Tabs value={active} onValueChange={(v) => setActive(v as TypeKey)} className="mt-10">
          <TabsList className="flex flex-wrap h-auto bg-card shadow-soft p-1.5 rounded-xl">
            {TYPES.map((tp) => (
              <TabsTrigger key={tp.slug} value={tp.slug} className="gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <tp.icon className="size-4" /> {t(`types.${tp.slug}.name`)}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={active} className="mt-8 grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <FloorPlanVisual type={activeType} />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-2xl font-bold">{t(`types.${activeType.slug}.name`)}</h3>
                <p className="text-muted-foreground mt-2">{t(`types.${activeType.slug}.tagline`)}</p>
              </div>
              <div className="rounded-xl bg-accent/15 border border-accent/30 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
                  <Sparkles className="size-4" /> {t("floorPlans.spacePerceptionTrick")}
                </div>
                <p className="mt-2 text-sm text-foreground/80">{t(`types.${activeType.slug}.spaceTrick`)}</p>
              </div>
              <div className="space-y-3">
                {activeType.floorPlanZones.map((z) => (
                  <div key={z.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-foreground/80">{z.label}</span>
                      <span className="font-medium">{z.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${z.pct}%`, background: z.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild variant="brand" size="lg">
                <Link to="/properties" search={{ type: activeType.slug, q: "" }}>
                  {t("floorPlans.exploreListings", { name: t(`types.${activeType.slug}.name`) })} <ArrowRight />
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function FloorPlanVisual({ type }: { type: PropertyType }) {
  // Build a simple stacked/grid plan from zones
  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-card p-4 shadow-soft">
      <div className="aspect-[4/3] w-full rounded-xl bg-muted/40 p-3 grid gap-2"
           style={{ gridTemplateColumns: type.floorPlanZones.length > 3 ? "1.5fr 1fr" : "1fr", gridAutoRows: "1fr" }}>
        {type.floorPlanZones.map((z, i) => (
          <div
            key={z.label}
            className="rounded-lg flex flex-col justify-end p-3 relative overflow-hidden border border-white/40"
            style={{
              background: `linear-gradient(135deg, color-mix(in oklab, ${z.color} 35%, white), color-mix(in oklab, ${z.color} 75%, white))`,
              gridColumn: i === 0 && type.floorPlanZones.length > 3 ? "1 / 2" : undefined,
              gridRow:
                i === 0 && type.floorPlanZones.length > 3
                  ? `1 / ${Math.max(2, type.floorPlanZones.length - 1)}`
                  : undefined,
            }}
          >
            <div className="text-xs uppercase tracking-wider font-semibold text-foreground/70">
              {z.label}
            </div>
            <div className="text-2xl font-bold text-foreground">{z.pct}%</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Indicative zoning — {type.minSize}+ m²</span>
        <span className="flex items-center gap-1"><Ruler className="size-3" /> Architectural schematic</span>
      </div>
    </div>
  );
}

/* ---------------- Calculator ---------------- */

function CalculatorSection() {
  const { t } = useTranslation("propertyTypes");
  const [budget, setBudget] = useState(500000);
  const [familySize, setFamilySize] = useState(3);
  const [land, setLand] = useState(0);

  const recommendations = useMemo(() => {
    return TYPES.map((t2) => {
      let score = 0;
      // Budget fit
      if (budget >= t2.startingPrice) score += 40;
      else score += Math.max(0, 40 - ((t2.startingPrice - budget) / t2.startingPrice) * 40);
      // Family fit
      const familyScore = matchFamily(t2.idealFamily, familySize);
      score += familyScore; // 0-35
      // Land hint
      if (land > 0) {
        if (land >= 200 && (t2.slug === "villa" || t2.slug === "country_house")) score += 25;
        else if (land >= 80 && t2.slug === "duplex") score += 22;
        else if (land < 80 && (t2.slug === "apartment" || t2.slug === "studio")) score += 20;
        else score += 8;
      } else {
        score += 12;
      }
      return { type: t2, score: Math.round(Math.min(100, score)) };
    }).sort((a, b) => b.score - a.score);
  }, [budget, familySize, land]);

  const top = recommendations.slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <SectionHeader
        eyebrow={t("calculator.eyebrow")}
        title={t("calculator.title")}
        subtitle={t("calculator.subtitle")}
      />
      <div className="mt-10 grid lg:grid-cols-5 gap-8">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="size-5 text-secondary" /> {t("calculator.yourInputs")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <div className="flex justify-between mb-3">
                <Label className="flex items-center gap-2"><Wallet className="size-4" /> {t("calculator.budget")}</Label>
                <span className="font-semibold text-secondary">{formatEGP(budget)}</span>
              </div>
              <Slider
                value={[budget]}
                min={150000}
                max={3000000}
                step={25000}
                onValueChange={(v) => setBudget(v[0])}
              />
            </div>
            <div>
              <div className="flex justify-between mb-3">
                <Label className="flex items-center gap-2"><Users className="size-4" /> {t("calculator.familySize")}</Label>
                <span className="font-semibold text-secondary">{t("calculator.peopleUnit", { count: familySize })}</span>
              </div>
              <Slider
                value={[familySize]}
                min={1}
                max={8}
                step={1}
                onValueChange={(v) => setFamilySize(v[0])}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-3"><Ruler className="size-4" /> {t("calculator.availableLand")}</Label>
              <Input
                type="number"
                min={0}
                value={land || ""}
                placeholder={t("calculator.landPlaceholder")}
                onChange={(e) => setLand(Number(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground mt-2">{t("calculator.landHint")}</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {top.map((r, idx) => (
            <Card
              key={r.type.slug}
              className={`shadow-soft transition-all ${idx === 0 ? "border-secondary border-2 shadow-elegant" : ""}`}
            >
              <CardContent className="p-5 flex items-center gap-5">
                <div className="size-14 rounded-xl bg-brand-gradient text-white flex items-center justify-center shrink-0">
                  <r.type.icon className="size-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{t(`types.${r.type.slug}.name`)}</h3>
                    {idx === 0 && (
                      <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
                        {t("calculator.bestMatch")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{t(`types.${r.type.slug}.tagline`)}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{formatEGP(r.type.startingPrice)}+</span>
                    <span>·</span>
                    <span>{t(`types.${r.type.slug}.idealFamily`)}</span>
                    <span>·</span>
                    <span className="text-secondary font-medium">{r.type.rentYield}{t("calculator.yieldSuffix")}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-bold text-secondary">{r.score}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("calculator.matchLabel")}</div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button asChild variant="brand" size="lg" className="w-full">
            <Link to="/consultation">
              {t("calculator.bookConsultation")} <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */

function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
      <div className="rounded-3xl bg-brand-gradient text-white p-10 md:p-16 shadow-elegant relative overflow-hidden">
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">
            Still deciding? Talk to an architect, not a sales agent.
          </h2>
          <p className="mt-4 text-white/85 text-lg">
            We'll review your land, family and budget — then return with two structural options
            and a sustainability brief, free of charge.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/consultation">Book consultation <ArrowRight /></Link>
            </Button>
            <Button asChild variant="outlineHero" size="xl">
              <Link to="/properties" search={{ type: "all", q: "" }}>Browse properties</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Helpers ---------------- */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  light = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div
        className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${light ? "text-accent" : "text-secondary"}`}
      >
        <span className={`h-px w-8 ${light ? "bg-accent" : "bg-secondary"}`} />
        {eyebrow}
        <span className={`h-px w-8 ${light ? "bg-accent" : "bg-secondary"}`} />
      </div>
      <h2 className={`mt-4 text-3xl md:text-4xl font-bold text-balance ${light ? "text-primary-foreground" : ""}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-lg ${light ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function MaintenancePill({ level, label }: { level: "Low" | "Medium" | "High"; label: string }) {
  const styles =
    level === "Low"
      ? "bg-secondary/15 text-secondary"
      : level === "Medium"
        ? "bg-accent/20 text-accent-foreground"
        : "bg-destructive/15 text-destructive";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}

function formatEGP(n: number) {
  if (n >= 1_000_000) return `EGP ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  return `EGP ${(n / 1000).toFixed(0)}K`;
}

function matchFamily(ideal: string, size: number): number {
  // crude parser for "X people" or "X–Y people"
  const range = ideal.match(/(\d+)(?:[–-](\d+))?/);
  if (!range) return 15;
  const min = Number(range[1]);
  const max = range[2] ? Number(range[2]) : min;
  if (size >= min && size <= max) return 35;
  const diff = size < min ? min - size : size - max;
  return Math.max(0, 35 - diff * 8);
}
