import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  Eye,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Phone,
  Heart,
  Headphones,
  Sparkles,
  Home,
  ChefHat,
  Sofa,
  ShowerHead,
  Trees,
  TrendingUp,
  Glasses,
  Building2,
  BadgePercent,
  CalendarClock,
  Compass,
  PlayCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type SearchState = { type?: string; q?: string; beds?: string; sort?: string; deal?: string; category?: string };

export const Route = createFileRoute("/properties/")({
  validateSearch: (s: Record<string, unknown>): SearchState => ({
    type: (s.type as string) || "all",
    q: (s.q as string) || "",
    beds: (s.beds as string) || "any",
    sort: (s.sort as string) || "featured",
    deal: (s.deal as string) || "all",
    category: (s.category as string) || "all",
  }),
  head: () => ({
    meta: [
      { title: "Properties — IBN BEITAK 2026" },
      {
        name: "description",
        content:
          "Live property listings with smart-home unit specs, mood boards, owner contact and engagement counters.",
      },
    ],
  }),
  component: ListingsPage,
});

const TYPE_VALUES = ["all", "villa", "apartment", "duplex", "country_house", "studio", "smart_home"];
const BED_VALUES = ["any", "1", "2", "3", "4"];
const SORT_VALUES = ["featured", "price_asc", "price_desc", "newest"];
const TAB_IDS = ["properties", "invest", "vr"];

const MOOD_ICON_DEFS = [
  { Icon: ChefHat, key: "kitchen" },
  { Icon: Sofa, key: "living" },
  { Icon: ShowerHead, key: "bath" },
  { Icon: BedDouble, key: "beds" },
  { Icon: Trees, key: "garden" },
];

function ListingsPage() {
  const { t } = useTranslation("listings");
  const { type, q, beds, sort, deal, category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [items, setItems] = useState<Property[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("properties");
  const { user } = useAuth();

  const TYPES = TYPE_VALUES.map((value) => ({ value, label: t(`properties.types.${value}`) }));
  const BEDS = BED_VALUES.map((value) => ({ value, label: t(`properties.beds.${value}`) }));
  const SORTS = SORT_VALUES.map((value) => ({ value, label: t(`properties.sorts.${value}`) }));
  const TABS = TAB_IDS.map((id) => ({ id, label: t(`properties.tabs.${id}`) }));
  const MOOD_ICONS = MOOD_ICON_DEFS.map(({ Icon, key }) => ({ Icon, label: t(`properties.moodIcons.${key}`) }));

  const setSearch = (patch: Partial<SearchState>) =>
    navigate({ search: (prev: SearchState) => ({ ...prev, ...patch }) });

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  useEffect(() => {
    if (!user) return setFavIds(new Set());
    supabase
      .from("favorites")
      .select("property_id")
      .eq("user_id", user.id)
      .then(({ data }) => setFavIds(new Set(data?.map((f) => f.property_id) ?? [])));
  }, [user]);

  const filtered = useMemo(() => {
    const qLower = (q ?? "").toLowerCase().trim();
    const minBeds = beds && beds !== "any" ? Number(beds) : 0;
    const list = items.filter((p) => {
      if (type && type !== "all" && p.type !== type) return false;
      if (deal && deal !== "all" && (p as Property & { listing_type?: string }).listing_type !== deal) return false;
      if (category && category !== "all" && (p as Property & { category?: string }).category !== category) return false;
      if (minBeds && (p.bedrooms ?? 0) < minBeds) return false;
      if (qLower && !`${p.title} ${p.location ?? ""}`.toLowerCase().includes(qLower)) return false;
      return true;
    });
    const sorted = [...list];
    if (sort === "price_asc") sorted.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === "price_desc") sorted.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === "newest")
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return sorted;
  }, [items, type, q, beds, sort]);

  const toggleFav = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error(t("properties.signInFavorites"));
    const isFav = favIds.has(propertyId);
    if (isFav) {
      const { error } = await supabase.from("favorites").delete()
        .eq("user_id", user.id).eq("property_id", propertyId);
      if (error) return toast.error(error.message);
      setFavIds((prev) => { const n = new Set(prev); n.delete(propertyId); return n; });
    } else {
      const { error } = await supabase.from("favorites")
        .insert({ user_id: user.id, property_id: propertyId });
      if (error) return toast.error(error.message);
      setFavIds((prev) => new Set(prev).add(propertyId));
    }
  };

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(14,165,233,0.18), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(99,102,241,0.15), transparent 60%), linear-gradient(180deg,#060b1a 0%,#0a1230 50%,#060b1a 100%)",
      }}
    >
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 border-b border-white/10 backdrop-blur-xl bg-[#060b1a]/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-wide">
            {t("properties.brand")} <span className="text-cyan-400">2026</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-[13px] tracking-[0.18em]">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative py-5 transition ${
                  activeTab === t.id ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.label}
                {activeTab === t.id && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-[13px] tracking-[0.18em] text-slate-300">
              {t("properties.detailsBar")} <span className="text-slate-500 mx-1">|</span>{" "}
              <span className="text-cyan-300">العقار</span>
            </span>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 ring-2 ring-white/20" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* TAB INTRO CARD */}
        <TabIntro tab={activeTab} />

        {activeTab === "properties" && (
          <>
            {/* FILTER GLASS */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 md:p-4 mb-8 shadow-[0_8px_40px_-12px_rgba(8,145,178,0.35)]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="relative md:col-span-5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-300" />
                  <input
                    value={q}
                    onChange={(e) => setSearch({ q: e.target.value })}
                    placeholder={t("properties.filters.searchPlaceholder")}
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-slate-400 focus:outline-none focus:border-cyan-400/60"
                  />
                </div>
                <GlassSelect className="md:col-span-3" value={type ?? "all"} onChange={(v) => setSearch({ type: v })} options={TYPES} />
                <GlassSelect className="md:col-span-2" value={beds ?? "any"} onChange={(v) => setSearch({ beds: v })} options={BEDS} />
                <GlassSelect className="md:col-span-2" value={sort ?? "featured"} onChange={(v) => setSearch({ sort: v })} options={SORTS} />

              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                <span>{t("properties.filters.matchingListings", { count: filtered.length })}</span>
                <button
                  onClick={() => setSearch({ type: "all", q: "", beds: "any", sort: "featured" })}
                  className="text-cyan-300 hover:text-cyan-200"
                >
                  {t("properties.filters.reset")}
                </button>
              </div>
            </section>

            {/* GRID */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-16 text-center text-slate-400">
                {t("properties.filters.noResults")}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p, i) => (
                  <GlassPropertyCard
                    key={p.id}
                    property={p}
                    index={i}
                    isFavorite={favIds.has(p.id)}
                    onToggleFav={(e) => toggleFav(e, p.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "invest" && <InvestPanel />}
        {activeTab === "vr" && <VRPanel />}


        {/* DEVELOPER STRIP */}
        <section className="mt-14 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-white/5 to-indigo-500/10 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-cyan-500/20 border border-cyan-300/30 flex items-center justify-center">
              <Home className="h-7 w-7 text-cyan-300" />
            </div>
            <div>
              <div className="text-xs tracking-[0.2em] text-cyan-300">{t("properties.brand")}</div>
              <div className="text-xl font-bold">{t("properties.developerStrip.tagline")}</div>
              <div className="text-sm text-slate-300">
                {t("properties.developerStrip.description")}
              </div>
            </div>
          </div>
          <a
            href="tel:+201000000000"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-6 h-12 shadow-[0_8px_30px_-8px_rgba(34,211,238,0.7)] transition"
          >
            <Phone className="h-4 w-4" /> {t("properties.developerStrip.callNow")}
          </a>
        </section>
      </main>

      {/* AI ASSISTANT BUBBLE */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/15 bg-[#0a1230]/90 backdrop-blur px-4 py-2 text-xs text-slate-200 shadow-xl">
          <Headphones className="h-4 w-4 text-cyan-300" />
          <span className="font-semibold">{t("properties.aiAssistant.label")}</span>
          <span className="text-slate-400">{t("properties.aiAssistant.hint")}</span>
        </div>
        <button className="h-12 w-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 flex items-center justify-center shadow-[0_10px_30px_-6px_rgba(34,211,238,0.7)]">
          <Sparkles className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function GlassSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-cyan-400/60 [&>option]:bg-[#0a1230] [&>option]:text-slate-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function GlassPropertyCard({
  property,
  index,
  isFavorite,
  onToggleFav,
}: {
  property: Property;
  index: number;
  isFavorite: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
}) {
  const img =
    property.image_urls?.[0] ??
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&auto=format&fit=crop";

  const { t } = useTranslation("listings");
  const code = `EBK-${String(2024 + (index % 3)).padStart(4, "0")}`;
  const views = 1250 + index * 137;
  const arabicLabelKey =
    property.type === "villa" ? "villa"
    : property.type === "apartment" ? "apartment"
    : property.type === "duplex" ? "duplex"
    : property.type === "studio" ? "studio"
    : property.type === "country_house" ? "country_house"
    : "default";
  const arabicLabel = t(`properties.card.arabicLabels.${arabicLabelKey}`);

  return (
    <Link
      to="/properties/$id"
      params={{ id: property.id }}
      className="group relative block rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] hover:border-cyan-400/40 hover:shadow-[0_15px_60px_-15px_rgba(34,211,238,0.45)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Hero */}
      <div className="relative aspect-[16/11] overflow-hidden">
        <img
          src={img}
          alt={property.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060b1a]/95 via-[#060b1a]/30 to-transparent" />

        {/* Top-left: code + views */}
        <div className="absolute top-3 left-3 rounded-xl border border-amber-300/40 bg-[#060b1a]/70 backdrop-blur px-3 py-1.5 text-[11px]">
          <div className="text-amber-300 font-semibold">{t("properties.card.propertyCode", { code })}</div>
          <div className="flex items-center gap-1 text-slate-200 mt-0.5">
            <Eye className="h-3 w-3" /> {t("properties.card.views", { count: views.toLocaleString() })}
          </div>
        </div>

        {/* Top-right: Arabic label */}
        <div className="absolute top-3 right-3 rounded-xl border border-white/15 bg-white/10 backdrop-blur px-3 py-1.5 text-sm font-semibold">
          {arabicLabel}
        </div>

        {/* Favorite */}
        <button
          onClick={onToggleFav}
          aria-label={t("properties.toggleFavorite")}
          className="absolute top-16 right-3 h-9 w-9 rounded-full bg-[#060b1a]/70 backdrop-blur border border-white/15 flex items-center justify-center hover:scale-110 transition"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-400 text-rose-400" : "text-slate-200"}`} />
        </button>

        {/* Mood-board strip */}
        <div className="absolute left-3 right-3 bottom-3 rounded-2xl border border-white/15 bg-[#060b1a]/75 backdrop-blur px-3 py-2.5 flex items-center justify-between">
          {MOOD_ICON_DEFS.map(({ Icon, key }) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <span className="h-9 w-9 rounded-full bg-cyan-500/20 border border-cyan-300/40 flex items-center justify-center">
                <Icon className="h-4 w-4 text-cyan-300" />
              </span>
              <span className="text-[9px] text-slate-300">{t(`properties.moodIcons.${key}`)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-semibold text-lg leading-tight line-clamp-1 mb-1">
          {property.title}
        </h3>
        {property.location && (
          <p className="flex items-center gap-1 text-xs text-slate-400 mb-3">
            <MapPin className="h-3 w-3" /> {property.location}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-slate-300 mb-4">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5 text-cyan-300" /> {property.bedrooms}</span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5 text-cyan-300" /> {property.bathrooms}</span>
          )}
          {property.area_sqm != null && (
            <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5 text-cyan-300" /> {property.area_sqm}m²</span>
          )}
        </div>
        <div className="flex items-end justify-between pt-3 border-t border-white/10">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{t("properties.card.startingFrom")}</div>
            <div className="text-xl font-bold text-cyan-300">
              {new Intl.NumberFormat("en-US").format(Number(property.price))}{" "}
              <span className="text-xs text-slate-400">{property.currency}</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/90 hover:bg-cyan-400 text-slate-900 text-xs font-semibold px-3 py-2 transition">
            <Phone className="h-3.5 w-3.5" /> {t("properties.card.details")}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------------- Tab Intro + Panels ---------------- */

const TAB_INTRO_META: Record<string, { image: string; Icon: typeof Home }> = {
  properties: {
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop",
    Icon: Home,
  },
  invest: {
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop",
    Icon: TrendingUp,
  },
  vr: {
    image:
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1600&auto=format&fit=crop",
    Icon: Glasses,
  },
};

function TabIntro({ tab }: { tab: string }) {
  const { t } = useTranslation("listings");
  const key = TAB_INTRO_META[tab] ? tab : "properties";
  const meta = TAB_INTRO_META[key];
  const { Icon } = meta;
  return (
    <section className="mb-8 grid md:grid-cols-5 gap-6 items-stretch">
      <div className="md:col-span-3 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-7 md:p-9 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-[11px] tracking-[0.2em] text-cyan-300 mb-4">
          <Icon className="h-3.5 w-3.5" /> {t(`properties.tabIntros.${key}.badge`)}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{t(`properties.tabIntros.${key}.title`)}</h1>
        <p className="text-slate-300 mb-4">{t(`properties.tabIntros.${key}.content`)}</p>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2"><span className="text-cyan-300 font-semibold">{t("properties.tabIntros.detailsLabel")}</span> {t(`properties.tabIntros.${key}.details`)}</li>
          <li className="flex gap-2"><span className="text-amber-300 font-semibold">{t("properties.tabIntros.objectiveLabel")}</span> {t(`properties.tabIntros.${key}.objective`)}</li>
        </ul>
      </div>
      <div className="md:col-span-2 relative rounded-3xl overflow-hidden border border-white/10 min-h-[240px] shadow-[0_15px_60px_-20px_rgba(34,211,238,0.45)]">
        <img
          src={meta.image}
          alt={t(`properties.tabIntros.${key}.title`)}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#060b1a]/80 via-[#060b1a]/20 to-transparent" />
      </div>
    </section>
  );
}

const INVEST_DEALS = [
  {
    key: "marina",
    roi: "14% / yr",
    plan: "8 years · 5% down",
    growth: "+32% projected (3 yr)",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&auto=format&fit=crop",
  },
  {
    key: "capital",
    roi: "11% / yr",
    plan: "6 years · 10% down",
    growth: "+24% projected (3 yr)",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&auto=format&fit=crop",
  },
  {
    key: "zayed",
    roi: "9% / yr",
    plan: "5 years · 15% down",
    growth: "+18% projected (3 yr)",
    image:
      "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1400&auto=format&fit=crop",
  },
];

function InvestPanel() {
  const { t } = useTranslation("listings");
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-8">
      {INVEST_DEALS.map((d) => (
        <article
          key={d.key}
          className="group rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden hover:border-amber-300/40 hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)]"
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <img src={d.image} alt={t(`properties.invest.deals.${d.key}.name`)} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060b1a]/95 via-[#060b1a]/20 to-transparent" />
            <div className="absolute top-3 left-3 rounded-full border border-amber-300/40 bg-[#060b1a]/70 backdrop-blur px-3 py-1 text-[11px] text-amber-300 font-semibold flex items-center gap-1">
              <BadgePercent className="h-3 w-3" /> {t("properties.invest.roiLabel", { roi: d.roi })}
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-1.5 text-[11px] tracking-[0.18em] text-cyan-300 mb-1">
              <Building2 className="h-3.5 w-3.5" /> {t("properties.invest.offPlan")}
            </div>
            <h3 className="text-lg font-semibold mb-1">{t(`properties.invest.deals.${d.key}.name`)}</h3>
            <p className="flex items-center gap-1 text-xs text-slate-400 mb-4">
              <MapPin className="h-3 w-3" /> {t(`properties.invest.deals.${d.key}.location`)}
            </p>
            <div className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-3">
              <div className="flex items-center gap-2"><CalendarClock className="h-3.5 w-3.5 text-cyan-300" /> {d.plan}</div>
              <div className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5 text-emerald-300" /> {d.growth}</div>
            </div>
            <button className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-sm font-semibold h-10 transition">
              {t("properties.invest.requestMemo")} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

const VR_TOURS = [
  {
    key: "penthouse",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&auto=format&fit=crop",
  },
  {
    key: "villa",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&auto=format&fit=crop",
  },
  {
    key: "loft",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1400&auto=format&fit=crop",
  },
];

function VRPanel() {
  const { t } = useTranslation("listings");
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-8">
      {VR_TOURS.map((tour) => (
        <article
          key={tour.key}
          className="group relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden hover:border-cyan-400/50 hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)]"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <img src={tour.image} alt={t(`properties.vr.tours.${tour.key}.name`)} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060b1a]/95 via-[#060b1a]/30 to-transparent" />
            <div className="absolute top-3 left-3 rounded-full border border-cyan-300/40 bg-[#060b1a]/70 backdrop-blur px-3 py-1 text-[11px] text-cyan-300 font-semibold flex items-center gap-1">
              <Compass className="h-3 w-3" /> {t("properties.vr.badge")}
            </div>
            <button
              aria-label={t("properties.vr.playAria")}
              className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-900 flex items-center justify-center shadow-[0_10px_40px_-8px_rgba(34,211,238,0.8)] transition group-hover:scale-110"
            >
              <PlayCircle className="h-8 w-8" />
            </button>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">{t(`properties.vr.tours.${tour.key}.name`)}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{t(`properties.vr.tours.${tour.key}.rooms`)}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/90 hover:bg-cyan-400 text-slate-900 text-xs font-semibold px-3 py-2 transition">
              <Glasses className="h-3.5 w-3.5" /> {t("properties.vr.enter")}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}

