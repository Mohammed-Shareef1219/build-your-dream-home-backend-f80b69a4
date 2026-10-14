import { useState } from "react";
import { TrendingUp, TrendingDown, LineChart as LineChartIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/** Deterministic 12-month series per city (avg EGP / m²). Ocean-average +25.4% matches. */
const CITIES = [
  "newCairo",
  "fifthSettlement",
  "sixOctober",
  "sheikhZayed",
  "maadi",
  "nasrCity",
  "misrAlqadima",
  "misrAljadida",
  "northCoast",
  "marsaMatrouh",
] as const;

type CityKey = (typeof CITIES)[number];

const CITY_BASE: Record<CityKey, number> = {
  newCairo: 16800,
  fifthSettlement: 15200,
  sixOctober: 11800,
  sheikhZayed: 13500,
  maadi: 19400,
  nasrCity: 10900,
  misrAlqadima: 16100,
  misrAljadida: 12300,
  northCoast: 21000,
  marsaMatrouh: 8900,
};

const MONTHS_EN = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const MONTHS_AR = ["نوف", "ديس", "ينا", "فبر", "مار", "أبر", "ماي", "يون", "يول", "أغس", "سبت", "أكت"];

function seriesFor(city: CityKey, months: string[]) {
  const base = CITY_BASE[city];
  // Smooth upward trend ending exactly at +25.4% over 12 months.
  const factor = 1.254;
  return months.map((m, i) => {
    const t = i / (months.length - 1);
    const eased = Math.pow(t, 1.15); // slightly curved path
    const value = Math.round((base * (1 + (factor - 1) * eased)) / 10) * 10;
    return { month: m, value };
  });
}

export function PriceTrend() {
  const { t, i18n } = useTranslation("home");
  const [city, setCity] = useState<CityKey>("fifthSettlement");
  const isAr = i18n.language?.startsWith("ar");
  const months = isAr ? MONTHS_AR : MONTHS_EN;
  const data = seriesFor(city, months);
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const change = ((last - first) / first) * 100;
  const rising = change >= 0;

  return (
    <section className="bg-muted/30 border-y py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[340px_1fr] items-start">
          {/* Left: copy + city selector */}
          <div>
            <span className="inline-flex items-center gap-2 text-secondary font-semibold text-sm uppercase tracking-wider">
              <LineChartIcon className="h-4 w-4" /> {t("market.eyebrow")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">{t("market.heading")}</h2>
            <p className="mt-3 text-muted-foreground text-lg">{t("market.sub")}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    city === c
                      ? "border-transparent bg-brand-gradient text-white shadow-glow"
                      : "border-border bg-card text-foreground/80 hover:bg-muted"
                  )}
                >
                  {t(`market.cities.${c}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Right: chart card */}
          <div className="rounded-3xl bg-card p-6 sm:p-8 shadow-soft hover:shadow-elegant transition-all">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-sm text-muted-foreground">{t("market.avgLabel")}</div>
                <div className="text-4xl font-bold">
                  {last.toLocaleString(isAr ? "ar-EG" : "en-US")}
                  <span className="text-base font-medium text-muted-foreground"> {t("market.unit")}</span>
                </div>
              </div>
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
                  rising ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                {rising ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {rising ? t("market.rising") : t("market.falling")} ({change >= 0 ? "+" : ""}
                {change.toFixed(1)}%)
              </div>
            </div>

            <div className="h-56 sm:h-72" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.65 0.14 170)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="oklch(0.65 0.14 170)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "oklch(0.55 0.02 240)" }}
                  />
                  <YAxis
                    domain={["dataMin - 500", "dataMax + 500"]}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tick={{ fontSize: 11, fill: "oklch(0.55 0.02 240)" }}
                    tickFormatter={(v: number) => v.toLocaleString("en-US")}
                  />
                  <Tooltip
                    formatter={(v) => [`${Number(v).toLocaleString("en-US")} ${t("market.unit")}`, t("market.avgLabel")]}
                    contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.01 240)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.6 0.13 170)"
                    strokeWidth={2.5}
                    fill="url(#priceFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-center text-sm text-muted-foreground">{t("market.period")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
