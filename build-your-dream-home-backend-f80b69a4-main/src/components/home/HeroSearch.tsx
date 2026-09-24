import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { MapPin, Search, Building2, ChevronDown, Sparkles } from "lucide-react";

type Purpose = "sale" | "rent";

/** Location options, in the order specified by the design. */
const CITY_KEYS = [
  "new_cairo",
  "october",
  "sheikh_zayed",
  "maadi",
  "heliopolis",
  "old_cairo",
  "nasr_city",
  "north_coast",
  "marsa_matrouh",
] as const;

/** Property-type options — grouped so "Land" filters both land projects. */
const TYPE_KEYS = [
  "apartment",
  "villa",
  "duplex",
  "studio",
  "smart_home",
  "coastal_home",
  "country_house",
  "land",
] as const;

/** A type option either maps 1:1 to a listing type or unions several. */
const TYPE_TO_LISTING: Record<string, string[]> = {
  apartment: ["apartment"],
  villa: ["villa"],
  duplex: ["duplex"],
  studio: ["studio"],
  smart_home: ["smart_home"],
  coastal_home: ["coastal_home"],
  country_house: ["country_house"],
  land: ["land_montcity", "land_agiba"],
};

/** Budget ceilings in EGP — "Up to <n>" brackets, "" means unbounded. */
const BUDGETS: Record<string, string> = {
  b40k: "40000",
  b75k: "75000",
  b800k: "800000",
  b1m: "1000000",
  b2_5m: "2500000",
  b3_5m: "3500000",
  b6m: "6000000",
  b12m: "12000000",
  b18m: "18000000",
  b22m: "22000000",
  b30m: "30000000",
  b35m: "35000000",
  b40m: "40000000",
  b50m: "50000000",
};

/**
 * One pill-shaped field from the design: icon + tiny uppercase label + value,
 * with a real <select> stretched invisibly on top so it stays accessible.
 */
function SelectField({
  icon,
  label,
  display,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  display: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative flex flex-1 min-w-0 items-center gap-3 rounded-2xl border border-border bg-card px-4 h-14 lg:h-16 cursor-pointer hover:border-ring/50 transition-colors">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="block truncate text-sm font-semibold text-foreground">{display}</span>
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function HeroSearch() {
  const { t } = useTranslation(["home", "listings"]);
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState<Purpose>("sale");
  const [city, setCity] = useState("");
  const [ptype, setPtype] = useState("all");
  const [budget, setBudget] = useState("any");

  const cityOptions = [
    { value: "", label: t("heroSearch.anyLocation") },
    ...CITY_KEYS.map((key) => ({ value: key, label: t(`heroSearch.cities.${key}`) })),
  ];
  const typeOptions = [
    { value: "all", label: t("heroSearch.anyProperty") },
    ...TYPE_KEYS.map((key) => ({ value: key, label: t(`heroSearch.types.${key}`) })),
  ];
  const typeDisplay = (v: string) =>
    v === "all"
      ? t("heroSearch.anyProperty")
      : t(`heroSearch.types.${v as (typeof TYPE_KEYS)[number]}`);
  const budgetOptions = [
    { value: "any", label: t("heroSearch.budgets.any") },
    ...Object.keys(BUDGETS).map((key) => ({ value: key, label: t(`heroSearch.budgets.${key}`) })),
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceMax = BUDGETS[budget] ?? "";
    // Grouped "land" option expands to its first concrete listing type (the
    // listings page matches exact types); groups with one member pass through.
    const listingTypes = TYPE_TO_LISTING[ptype] ?? [];
    navigate({
      to: "/properties",
      search: {
        type: listingTypes[0] ?? "all",
        q: "",
        beds: "any",
        sort: "featured",
        purpose,
        category: "residential",
        city: city || undefined,
        priceMax: priceMax || undefined,
      },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <form
        onSubmit={submit}
        className="rounded-[28px] bg-background/95 backdrop-blur-xl border border-white/60 shadow-elegant p-4 sm:p-5"
      >
        {/* Buy / Rent toggle */}
        <div
          className="mb-4 flex items-center gap-2"
          role="group"
          aria-label={t("heroSearch.purposeTitle")}
        >
          {(["sale", "rent"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPurpose(p)}
              aria-pressed={purpose === p}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                purpose === p
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "sale" ? t("heroSearch.buy") : t("heroSearch.rent")}
            </button>
          ))}
        </div>

        {/* Location · Property type · Budget · Search */}
        <div className="flex flex-col lg:flex-row items-stretch gap-2.5">
          <SelectField
            icon={<MapPin className="h-5 w-5" />}
            label={t("heroSearch.location")}
            display={city ? t(`heroSearch.cities.${city}`) : t("heroSearch.anyLocation")}
            value={city}
            onChange={setCity}
            options={cityOptions}
          />
          <SelectField
            icon={<Building2 className="h-5 w-5" />}
            label={t("heroSearch.propertyType")}
            display={typeDisplay(ptype)}
            value={ptype}
            onChange={setPtype}
            options={typeOptions}
          />
          <SelectField
            icon={<Sparkles className="h-5 w-5" />}
            label={t("heroSearch.budget")}
            display={t(`heroSearch.budgets.${budget}`)}
            value={budget}
            onChange={setBudget}
            options={budgetOptions}
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2.5 h-14 lg:h-16 rounded-2xl bg-secondary px-8 text-sm font-bold text-secondary-foreground shadow-glow hover:bg-secondary/90 transition-all"
          >
            <Search className="h-5 w-5" />
            {t("heroSearch.searchBtn")}
          </button>
        </div>
      </form>
    </div>
  );
}
