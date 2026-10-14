import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  Wind,
  Snowflake,
  Ruler,
  Users,
  Wallet,
  CheckCircle2,
  Calculator,
} from "lucide-react";
import { useTranslation } from "react-i18next";

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
  startingPrice: number; // AED
  pricePerSqm: number;
  minSize: number;
  idealFamily: string;
  maintenance: "Low" | "Medium" | "High";
  roi: number; // % yearly
  appreciation: number; // % yearly
  rentYield: number; // %
  liquidity: "High" | "Medium" | "Low";
  insulation: number; // 1-5
  naturalLight: number; // 1-5
  acStrategy: string;
  sustainability: string[];
  spaceTrick: string;
  floorPlanZones: { label: string; pct: number; color: string }[];
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
    insulation: 4,
    naturalLight: 3,
    acStrategy: "Single split unit with smart zoning",
    sustainability: ["LED-only lighting", "Compact thermal envelope", "Low water fixtures"],
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
    insulation: 4,
    naturalLight: 4,
    acStrategy: "Central VRF with per-room thermostats",
    sustainability: ["Shared building insulation", "Greywater recycling", "Smart metering"],
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
    insulation: 4,
    naturalLight: 5,
    acStrategy: "Two-zone central AC, upper/lower independent",
    sustainability: ["Stacked plumbing core", "Cross-ventilation stairwell", "Roof PV ready"],
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
    insulation: 5,
    naturalLight: 5,
    acStrategy: "Zoned ducted system + ceiling fans, mashrabiya shading",
    sustainability: ["Double-skin walls", "Solar water heating", "Greywater garden irrigation"],
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
    insulation: 5,
    naturalLight: 5,
    acStrategy: "Passive cooling + minimal split units; thermal mass walls",
    sustainability: ["Rammed-earth or stone walls", "Rainwater harvesting", "Solar PV array"],
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
    insulation: 5,
    naturalLight: 5,
    acStrategy: "AI-driven HVAC reacting to occupancy + weather forecasts",
    sustainability: ["Net-zero ready", "Battery storage", "Auto-tinting glazing"],
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
      <InvestmentSection />
      <SustainabilitySection />
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
            {TYPES.map((tp) => (
              <tr key={tp.slug} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                      <tp.icon className="size-4" />
                    </div>
                    <div>
                      <div className="font-semibold">{t(`types.${tp.slug}.name`)}</div>
                      <div className="text-xs text-muted-foreground">{t(`types.${tp.slug}.tagline`)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 font-medium whitespace-nowrap">
                  {formatAED(tp.startingPrice)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{tp.minSize} m²</td>
                <td className="px-4 py-4 whitespace-nowrap">{t(`types.${tp.slug}.idealFamily`)}</td>
                <td className="px-4 py-4">
                  <MaintenancePill level={tp.maintenance} label={t(`types.${tp.slug}.maintenance`)} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap font-medium text-secondary">
                  {tp.rentYield}%
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{t(`types.${tp.slug}.liquidity`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------------- Showcase (visual property type cards) ---------------- */

interface ShowcaseCard {
  slug: TypeKey | "custom";
  image: string;
  rating: number;
  properties: number;
  builder: string;
  seller: string;
  contact: string;
  custom?: boolean;
}

const SHOWCASE: ShowcaseCard[] = [
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
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE.map((c) => (
            <ShowcaseCardView key={c.slug} card={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseCardView({ card }: { card: ShowcaseCard }) {
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
              <Link to="/catalog/$slug" params={{ slug: card.slug as string }}>
                {t("showcase.explore")} <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
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
                <span className="font-semibold text-secondary">{formatAED(budget)}</span>
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
                    <span>{formatAED(r.type.startingPrice)}+</span>
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

/* ---------------- Investment ---------------- */

function InvestmentSection() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeader
          light
          eyebrow="Investment Aspect"
          title="The asset behind the home"
          subtitle="Each typology behaves differently on the market. Here's how."
        />
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TYPES.map((t) => (
            <div key={t.slug} className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="size-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                  <t.icon className="size-5" />
                </div>
                <h3 className="font-semibold text-lg">{t.name}</h3>
              </div>
              <div className="space-y-3">
                <Metric label="Annual ROI" value={`${t.roi}%`} />
                <Metric label="Appreciation / yr" value={`${t.appreciation}%`} />
                <Metric label="Rent yield" value={`${t.rentYield}%`} />
                <Metric label="Liquidity" value={t.liquidity} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-white/10 pb-2">
      <span className="text-primary-foreground/70">{label}</span>
      <span className="font-semibold text-accent">{value}</span>
    </div>
  );
}

/* ---------------- Sustainability ---------------- */

function SustainabilitySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <SectionHeader
        eyebrow="Building Sustainability"
        title="Smart by structure, not by sticker"
        subtitle="Insulation, AC strategy and natural lighting — designed into the bones of each typology."
      />
      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TYPES.map((t) => (
          <Card key={t.slug} className="shadow-soft hover:shadow-elegant transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <t.icon className="size-5" />
                </div>
                <h3 className="font-semibold text-lg">{t.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <RatingChip icon={Snowflake} label="Insulation" rating={t.insulation} />
                <RatingChip icon={Sun} label="Natural light" rating={t.naturalLight} />
              </div>
              <div className="text-sm flex items-start gap-2 mb-4 text-foreground/80">
                <Wind className="size-4 text-secondary shrink-0 mt-0.5" />
                <span>{t.acStrategy}</span>
              </div>
              <ul className="space-y-2">
                {t.sustainability.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="size-4 text-secondary shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function RatingChip({
  icon: Icon,
  label,
  rating,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  rating: number;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= rating ? "bg-secondary" : "bg-muted-foreground/20"}`}
          />
        ))}
      </div>
    </div>
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

function formatAED(n: number) {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  return `AED ${(n / 1000).toFixed(0)}K`;
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
