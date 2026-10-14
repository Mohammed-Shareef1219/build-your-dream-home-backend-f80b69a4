import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
  Ruler,
  Banknote,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type SearchState = {
  type?: string;
  q?: string;
  city?: string;
  beds?: string;
  sort?: string;
  deal?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
};

export const Route = createFileRoute("/properties/")({
  validateSearch: (s: Record<string, unknown>): SearchState => ({
    type: (s.type as string) || "all",
    q: (s.q as string) || "",
    city: (s.city as string) || "all",
    beds: (s.beds as string) || "any",
    sort: (s.sort as string) || "featured",
    deal: (s.deal as string) || "all",
    category: (s.category as string) || "all",
    minPrice: (s.minPrice as string) || "",
    maxPrice: (s.maxPrice as string) || "",
    minArea: (s.minArea as string) || "",
    maxArea: (s.maxArea as string) || "",
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

const TYPE_VALUES = [
  "all",
  "villa",
  "apartment",
  "duplex",
  "country_house",
  "studio",
  "smart_home",
];
const BED_VALUES = ["any", "1", "2", "3", "4"];
const SORT_VALUES = ["featured", "price_asc", "price_desc", "views_desc", "newest"];
const TAB_IDS = ["properties", "invest", "vr"];

const MOOD_ICON_DEFS = [
  { Icon: ChefHat, key: "kitchen" },
  { Icon: Sofa, key: "living" },
  { Icon: ShowerHead, key: "bath" },
  { Icon: BedDouble, key: "beds" },
  { Icon: Trees, key: "garden" },
];

/* ---------------- Size & price guide boards ---------------- */

type BoardDef = {
  key: string;
  /** property type filter ("all" for boards not tied to a single type) */
  type?: string;
  /** free-text query for keyword-based boards (land plots) */
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
};

const BOARDS: BoardDef[] = [
  { key: "studios", type: "studio", minArea: "45", minPrice: "1200000", maxPrice: "2500000" },
  { key: "apartments", type: "apartment", minArea: "90", minPrice: "2500000", maxPrice: "5500000" },
  { key: "duplexes", type: "duplex", minArea: "200", minPrice: "6000000", maxPrice: "10000000" },
  { key: "villas", type: "villa", minArea: "250", minPrice: "12000000", maxPrice: "25000000" },
  {
    key: "smart_homes",
    type: "smart_home",
    minArea: "150",
    minPrice: "5000000",
    maxPrice: "11000000",
  },
  {
    key: "garden_units",
    type: "country_house",
    minArea: "120",
    minPrice: "3500000",
    maxPrice: "7000000",
  },
  { key: "land_mont_city", q: "Mont City", minArea: "200", minPrice: "75000", maxPrice: "200000" },
  {
    key: "land_mont_agiba",
    q: "Mont Agiba",
    minArea: "150",
    minPrice: "50000",
    maxPrice: "100000",
  },
];

const BOARD_FIELD_DEFAULTS: Record<keyof Omit<BoardDef, "key" | "image">, string> = {
  type: "all",
  q: "",
  minPrice: "",
  maxPrice: "",
  minArea: "",
};

/** Derive which board (if any) matches the current URL filter state. */
function findActiveBoardKey(search: SearchState): string | null {
  const active = BOARDS.find((b) => {
    const boardVals: Record<string, string> = {
      type: b.type ?? BOARD_FIELD_DEFAULTS.type,
      q: b.q ?? BOARD_FIELD_DEFAULTS.q,
      minPrice: b.minPrice ?? BOARD_FIELD_DEFAULTS.minPrice,
      maxPrice: b.maxPrice ?? BOARD_FIELD_DEFAULTS.maxPrice,
      minArea: b.minArea ?? BOARD_FIELD_DEFAULTS.minArea,
    };
    const searchVals: Record<string, string> = {
      type: search.type ?? "all",
      q: search.q ?? "",
      minPrice: search.minPrice ?? "",
      maxPrice: search.maxPrice ?? "",
      minArea: search.minArea ?? "",
    };
    return Object.keys(boardVals).every((f) => boardVals[f] === searchVals[f]);
  });
  return active?.key ?? null;
}

/** Deterministic pseudo view-count per property (used for “Most viewed” sorting + badge). */
function propertyViews(p: Property): number {
  let h = 0;
  for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) >>> 0;
  return 1250 + (h % 2250);
}

/** Deterministic property code (EBK-2024 … EBK-2026) per property. */
function propertyCode(p: Property): string {
  let h = 0;
  for (let i = 0; i < p.id.length; i++) h = (h * 17 + p.id.charCodeAt(i)) >>> 0;
  return `EBK-${String(2024 + (h % 3))}`;
}

function ListingsPage() {
  const { t } = useTranslation("listings");
  const { type, q, city, beds, sort, deal, category, minPrice, maxPrice, minArea, maxArea } =
    Route.useSearch();
  const navigate = Route.useNavigate();
  const [items, setItems] = useState<Property[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("properties");
  const { user } = useAuth();

  /* Debounced local search state (lastSyncedQ guards against programmatic q updates) */
  const [searchInput, setSearchInput] = useState(q ?? "");
  const lastSyncedQ = useRef(q ?? "");
  useEffect(() => {
    if ((q ?? "") !== lastSyncedQ.current) {
      lastSyncedQ.current = q ?? "";
      setSearchInput(q ?? "");
    }
  }, [q]);
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchInput !== lastSyncedQ.current) {
        lastSyncedQ.current = searchInput;
        setSearch({ q: searchInput });
      }
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const TYPES = TYPE_VALUES.map((value) => ({ value, label: t(`properties.types.${value}`) }));
  const BEDS = BED_VALUES.map((value) => ({ value, label: t(`properties.beds.${value}`) }));
  const SORTS = SORT_VALUES.map((value) => ({ value, label: t(`properties.sorts.${value}`) }));
  const TABS = TAB_IDS.map((id) => ({ id, label: t(`properties.tabs.${id}`) }));

  const setSearch = (patch: Partial<SearchState>) =>
    navigate({ search: (prev: SearchState) => ({ ...prev, ...patch }) });

  const resetFilters = () =>
    setSearch({
      type: "all",
      q: "",
      city: "all",
      beds: "any",
      sort: "featured",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
    });

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

  /* City options derived from live listing locations */
  const CITIES = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => {
      (p.location ?? "")
        .split(/[,،]/)
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((c) => set.add(c));
    });
    return [
      { value: "all", label: t("properties.filters.cityAll") },
      ...[...set].sort().map((c) => ({ value: c, label: c })),
    ];
  }, [items, t]);

  const filtered = useMemo(() => {
    const qLower = (q ?? "").toLowerCase().trim();
    const minBeds = beds && beds !== "any" ? Number(beds) : 0;
    const selectedCity = city && city !== "all" ? city.toLowerCase() : "";
    const pMin = minPrice ? Number(minPrice) : null;
    const pMax = maxPrice ? Number(maxPrice) : null;
    const aMin = minArea ? Number(minArea) : null;
    const aMax = maxArea ? Number(maxArea) : null;

    const list = items.filter((p) => {
      if (type && type !== "all" && p.type !== type) return false;
      if (
        deal &&
        deal !== "all" &&
        (p as Property & { listing_type?: string }).listing_type !== deal
      )
        return false;
      if (
        category &&
        category !== "all" &&
        (p as Property & { category?: string }).category !== category
      )
        return false;
      if (minBeds && (p.bedrooms ?? 0) < minBeds) return false;
      if (selectedCity && !(p.location ?? "").toLowerCase().includes(selectedCity)) return false;

      const price = Number(p.price);
      if (pMin != null && price < pMin) return false;
      if (pMax != null && price > pMax) return false;
      const area = p.area_sqm ?? 0;
      if (aMin != null && area < aMin) return false;
      if (aMax != null && area > aMax) return false;

      if (qLower) {
        const haystack = `${p.title} ${p.location ?? ""} ${p.description ?? ""} ${(p.features ?? []).join(" ")}`;
        if (!haystack.toLowerCase().includes(qLower)) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sort === "price_asc") sorted.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === "price_desc") sorted.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === "views_desc") sorted.sort((a, b) => propertyViews(b) - propertyViews(a));
    else if (sort === "newest")
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return sorted;
  }, [items, type, q, city, beds, sort, deal, category, minPrice, maxPrice, minArea, maxArea]);

  const toggleFav = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error(t("properties.signInFavorites"));
    const isFav = favIds.has(propertyId);
    if (isFav) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", propertyId);
      if (error) return toast.error(error.message);
      setFavIds((prev) => {
        const n = new Set(prev);
        n.delete(propertyId);
        return n;
      });
    } else {
      const { error } = await supabase
        .from("favorites")
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
            {/* SIZE & PRICE GUIDE BOARDS */}
            <SizePriceBoards
              items={items}
              onApply={(patch) =>
                setSearch({
                  type: BOARD_FIELD_DEFAULTS.type,
                  q: BOARD_FIELD_DEFAULTS.q,
                  minPrice: BOARD_FIELD_DEFAULTS.minPrice,
                  maxPrice: BOARD_FIELD_DEFAULTS.maxPrice,
                  minArea: BOARD_FIELD_DEFAULTS.minArea,
                  maxArea: "",
                  city: "all",
                  beds: "any",
                  ...patch,
                })
              }
              onClear={() =>
                setSearch({
                  type: BOARD_FIELD_DEFAULTS.type,
                  q: BOARD_FIELD_DEFAULTS.q,
                  minPrice: BOARD_FIELD_DEFAULTS.minPrice,
                  maxPrice: BOARD_FIELD_DEFAULTS.maxPrice,
                  minArea: BOARD_FIELD_DEFAULTS.minArea,
                  maxArea: "",
                  city: "all",
                  beds: "any",
                })
              }
            />

            {/* FILTER GLASS */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 md:p-4 mb-8 shadow-[0_8px_40px_-12px_rgba(8,145,178,0.35)]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="relative md:col-span-5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-300" />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t("properties.filters.searchPlaceholder")}
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-slate-400 focus:outline-none focus:border-cyan-400/60"
                  />
                </div>
                <GlassSelect
                  className="md:col-span-3"
                  value={type ?? "all"}
                  onChange={(v) => setSearch({ type: v })}
                  options={TYPES}
                />
                <GlassSelect
                  className="md:col-span-2"
                  value={city ?? "all"}
                  onChange={(v) => setSearch({ city: v })}
                  options={CITIES}
                />
                <GlassSelect
                  className="md:col-span-2"
                  value={beds ?? "any"}
                  onChange={(v) => setSearch({ beds: v })}
                  options={BEDS}
                />

                <GlassSelect
                  className="md:col-span-3"
                  value={sort ?? "featured"}
                  onChange={(v) => setSearch({ sort: v })}
                  options={SORTS}
                />
                <RangeInput
                  className="md:col-span-2"
                  label={t("properties.filters.priceFrom")}
                  value={minPrice ?? ""}
                  onChange={(v) => setSearch({ minPrice: v })}
                />
                <RangeInput
                  className="md:col-span-2"
                  label={t("properties.filters.priceTo")}
                  value={maxPrice ?? ""}
                  onChange={(v) => setSearch({ maxPrice: v })}
                />
                <RangeInput
                  className="md:col-span-2"
                  label={t("properties.filters.areaFrom")}
                  value={minArea ?? ""}
                  onChange={(v) => setSearch({ minArea: v })}
                />
                <RangeInput
                  className="md:col-span-3"
                  label={t("properties.filters.areaTo")}
                  value={maxArea ?? ""}
                  onChange={(v) => setSearch({ maxArea: v })}
                />
              </div>
              <div className="mt-3 px-1">
                <span className="text-sm font-semibold text-cyan-300">
                  {t("properties.filters.matchingListings", { count: filtered.length })}
                </span>
              </div>
            </section>

            {/* GRID / NO RESULTS */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-16 text-center">
                <div className="text-xl font-bold text-slate-200 mb-2">
                  {t("properties.filters.noResultsTitle")}
                </div>
                <div className="text-sm text-slate-400 mb-6">
                  {t("properties.filters.noResultsText")}
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-6 h-11 shadow-[0_8px_30px_-8px_rgba(34,211,238,0.7)] transition"
                >
                  <Sparkles className="h-4 w-4" /> {t("properties.filters.resetFilters")}
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <GlassPropertyCard
                    key={p.id}
                    property={p}
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

function SizePriceBoards({
  items,
  onApply,
  onClear,
}: {
  items: Property[];
  onApply: (patch: Partial<SearchState>) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation("listings");
  const search = Route.useSearch();
  const activeKey = findActiveBoardKey(search);

  return (
    <section className="mb-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">{t("properties.boards.title")}</h2>
        <p className="text-sm text-slate-400 mt-2">{t("properties.boards.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {BOARDS.map((board) => {
          const boardVals: Record<string, string> = {
            type: board.type ?? BOARD_FIELD_DEFAULTS.type,
            q: board.q ?? BOARD_FIELD_DEFAULTS.q,
            minPrice: board.minPrice ?? BOARD_FIELD_DEFAULTS.minPrice,
            maxPrice: board.maxPrice ?? BOARD_FIELD_DEFAULTS.maxPrice,
            minArea: board.minArea ?? BOARD_FIELD_DEFAULTS.minArea,
          };
          const searchVals: Record<string, string> = {
            type: search.type ?? "all",
            q: search.q ?? "",
            minPrice: search.minPrice ?? "",
            maxPrice: search.maxPrice ?? "",
            minArea: search.minArea ?? "",
          };
          const isActive = activeKey === board.key;
          const matchingCount = items.filter((p) => {
            if (boardVals.type !== "all" && p.type !== boardVals.type) return false;
            if (
              boardVals.q &&
              !`${p.location ?? ""}`.toLowerCase().includes(boardVals.q.toLowerCase())
            )
              return false;
            const price = Number(p.price);
            if (price < Number(boardVals.minPrice)) return false;
            if (price > Number(boardVals.maxPrice)) return false;
            if ((p.area_sqm ?? 0) < Number(boardVals.minArea)) return false;
            return true;
          }).length;

          return (
            <button
              key={board.key}
              onClick={() =>
                isActive
                  ? onClear()
                  : onApply(
                      Object.fromEntries(
                        Object.entries(boardVals).filter(([, v]) => v !== ""),
                      ) as Partial<SearchState>,
                    )
              }
              className={`group relative text-left rounded-3xl border overflow-hidden backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${
                isActive
                  ? "border-cyan-400/70 shadow-[0_15px_50px_-15px_rgba(34,211,238,0.55)] ring-1 ring-cyan-400/50"
                  : "border-white/10 bg-white/[0.04] hover:border-cyan-400/40 hover:shadow-[0_15px_50px_-15px_rgba(34,211,238,0.35)]"
              }`}
            >
              {/* Cover image */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={t(`properties.boards.items.${board.key}.image`)}
                  alt={t(`properties.boards.items.${board.key}.title`)}
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                    isActive ? "" : "opacity-70"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060b1a] via-[#060b1a]/40 to-transparent" />
                <div className="absolute inset-x-4 bottom-2 flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-base leading-tight line-clamp-1">
                    {t(`properties.boards.items.${board.key}.title`)}
                  </h3>
                  {isActive && (
                    <span className="shrink-0 rounded-full bg-cyan-500/90 text-slate-900 text-[10px] font-bold px-2 py-0.5">
                      {t("properties.boards.activeFilter")}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <Ruler className="h-3.5 w-3.5 text-cyan-300 shrink-0" />
                  <span>
                    📐 {t("properties.boards.sizeLabel")}
                    {": "}
                    {t(`properties.boards.items.${board.key}.size`)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <Banknote className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                  <span>
                    💰 {t("properties.boards.priceLabel")}
                    {": "}
                    {t(`properties.boards.items.${board.key}.price`)}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-cyan-300">
                  <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-px" />
                  <span>💡 {t(`properties.boards.items.${board.key}.tip`)}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {t("properties.filters.matchingListings", { count: matchingCount })}
                  </span>
                  <span className="text-[11px] font-semibold text-cyan-300 group-hover:text-cyan-200">
                    {isActive ? "✕" : "→"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

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
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function RangeInput({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-1.5">
        {label}
      </label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

function GlassPropertyCard({
  property,
  isFavorite,
  onToggleFav,
}: {
  property: Property;
  isFavorite: boolean;
  onToggleFav: (e: React.MouseEvent) => void;
}) {
  const { t } = useTranslation("listings");
  const img =
    property.image_urls?.[0] ??
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&auto=format&fit=crop";

  const code = propertyCode(property);
  const views = propertyViews(property);
  const labelKey =
    property.type === "villa"
      ? "villa"
      : property.type === "apartment"
        ? "apartment"
        : property.type === "duplex"
          ? "duplex"
          : property.type === "studio"
            ? "studio"
            : property.type === "country_house"
              ? "country_house"
              : "default";
  const typeLabel = t(`properties.card.arabicLabels.${labelKey}`);

  const tagline = property.features?.[0] ?? property.description?.trim().slice(0, 80) ?? "";

  const amenities = [
    { Icon: ChefHat, key: "kitchen", active: true },
    { Icon: Sofa, key: "living", active: true },
    { Icon: ShowerHead, key: "bath", active: (property.bathrooms ?? 0) >= 1 },
    { Icon: BedDouble, key: "beds", active: (property.bedrooms ?? 0) >= 1 },
    {
      Icon: Trees,
      key: "garden",
      active: property.type !== "apartment" && property.type !== "studio",
    },
  ];

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

        {/* Top-left: property code + views */}
        <div className="absolute top-3 left-3 rounded-xl border border-amber-300/40 bg-[#060b1a]/70 backdrop-blur px-3 py-1.5 text-[11px]">
          <div className="text-amber-300 font-semibold">
            {t("properties.card.propertyCode", { code })}
          </div>
          <div className="flex items-center gap-1 text-slate-200 mt-0.5">
            <Eye className="h-3 w-3" />{" "}
            {t("properties.card.views", { count: views.toLocaleString() })}
          </div>
        </div>

        {/* Top-right: property type tag */}
        <div className="absolute top-3 right-3 rounded-xl border border-white/15 bg-white/10 backdrop-blur px-3 py-1.5 text-sm font-semibold">
          {typeLabel}
        </div>

        {/* Floating favorite heart */}
        <button
          onClick={onToggleFav}
          aria-label={t("properties.toggleFavorite")}
          className="absolute top-16 right-3 h-9 w-9 rounded-full bg-[#060b1a]/70 backdrop-blur border border-white/15 flex items-center justify-center hover:scale-110 transition"
        >
          <Heart
            className={`h-4 w-4 ${isFavorite ? "fill-rose-400 text-rose-400" : "text-slate-200"}`}
          />
        </button>

        {/* Amenity icon bar */}
        <div className="absolute left-3 right-3 bottom-3 rounded-2xl border border-white/15 bg-[#060b1a]/75 backdrop-blur px-3 py-2.5 flex items-center justify-between">
          {amenities.map(({ Icon, key, active }) => (
            <div
              key={key}
              className={`flex flex-col items-center gap-1 transition-opacity ${active ? "" : "opacity-40"}`}
            >
              <span
                className={`h-9 w-9 rounded-full flex items-center justify-center border ${
                  active ? "bg-cyan-500/20 border-cyan-300/40" : "bg-white/5 border-white/10"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-slate-500"}`} />
              </span>
              <span className="text-[9px] text-slate-300">{t(`properties.moodIcons.${key}`)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-semibold text-lg leading-tight line-clamp-1 mb-1">{property.title}</h3>
        {property.location && (
          <p className="flex items-center gap-1 text-xs text-slate-400 mb-2">
            <MapPin className="h-3 w-3" /> {property.location}
          </p>
        )}
        {tagline && (
          <p className="flex items-start gap-1.5 text-xs text-cyan-300 mb-3">
            <Sparkles className="h-3.5 w-3.5 shrink-0 mt-px text-amber-300" />
            <span className="line-clamp-1">{tagline}</span>
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-slate-300 mb-4">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-cyan-300" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-cyan-300" /> {property.bathrooms}
            </span>
          )}
          {property.area_sqm != null && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5 text-cyan-300" /> {property.area_sqm}m²
            </span>
          )}
        </div>
        <div className="flex items-end justify-between pt-3 border-t border-white/10">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              {t("properties.card.startingFrom")}
            </div>
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
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          {t(`properties.tabIntros.${key}.title`)}
        </h1>
        <p className="text-slate-300 mb-4">{t(`properties.tabIntros.${key}.content`)}</p>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2">
            <span className="text-cyan-300 font-semibold">
              {t("properties.tabIntros.detailsLabel")}
            </span>{" "}
            {t(`properties.tabIntros.${key}.details`)}
          </li>
          <li className="flex gap-2">
            <span className="text-amber-300 font-semibold">
              {t("properties.tabIntros.objectiveLabel")}
            </span>{" "}
            {t(`properties.tabIntros.${key}.objective`)}
          </li>
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
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&auto=format&fit=crop",
  },
  {
    key: "capital",
    roi: "11% / yr",
    plan: "6 years · 10% down",
    growth: "+24% projected (3 yr)",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop",
  },
  {
    key: "zayed",
    roi: "9% / yr",
    plan: "5 years · 15% down",
    growth: "+18% projected (3 yr)",
    image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1400&auto=format&fit=crop",
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
            <img
              src={d.image}
              alt={t(`properties.invest.deals.${d.key}.name`)}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060b1a]/95 via-[#060b1a]/20 to-transparent" />
            <div className="absolute top-3 left-3 rounded-full border border-amber-300/40 bg-[#060b1a]/70 backdrop-blur px-3 py-1 text-[11px] text-amber-300 font-semibold flex items-center gap-1">
              <BadgePercent className="h-3 w-3" /> {t("properties.invest.roiLabel", { roi: d.roi })}
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-1.5 text-[11px] tracking-[0.18em] text-cyan-300 mb-1">
              <Building2 className="h-3.5 w-3.5" /> {t("properties.invest.offPlan")}
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {t(`properties.invest.deals.${d.key}.name`)}
            </h3>
            <p className="flex items-center gap-1 text-xs text-slate-400 mb-4">
              <MapPin className="h-3 w-3" /> {t(`properties.invest.deals.${d.key}.location`)}
            </p>
            <div className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-3.5 w-3.5 text-cyan-300" /> {d.plan}
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-300" /> {d.growth}
              </div>
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
            <img
              src={tour.image}
              alt={t(`properties.vr.tours.${tour.key}.name`)}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
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
              <h3 className="text-base font-semibold">
                {t(`properties.vr.tours.${tour.key}.name`)}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t(`properties.vr.tours.${tour.key}.rooms`)}
              </p>
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
