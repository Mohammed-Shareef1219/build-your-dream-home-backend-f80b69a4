import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown } from "lucide-react";

type AreaKey = "fifth_settlement" | "sheikh_zayed" | "north_coast" | "marsa_matrouh";

const AREA_KEYS: AreaKey[] = ["fifth_settlement", "sheikh_zayed", "north_coast", "marsa_matrouh"];

// Deterministic demo series (EGP / m², monthly over 12 months)
const SERIES: Record<AreaKey, number[]> = {
  fifth_settlement: [14200, 14500, 14700, 15100, 15300, 15600, 16000, 16300, 16600, 17000, 17300, 17800],
  sheikh_zayed: [15800, 16100, 16300, 16500, 16900, 17200, 17400, 17800, 18100, 18500, 18800, 19400],
  north_coast: [9800, 10200, 10500, 10900, 11400, 12000, 12700, 13300, 13800, 14500, 15100, 15900],
  marsa_matrouh: [7600, 7800, 8100, 8300, 8600, 8900, 9300, 9700, 10100, 10500, 10900, 11400],
};

const W = 640;
const H = 220;
const PAD_X = 8;
const PAD_Y = 16;

export function PriceTrend() {
  const { t } = useTranslation("home");
  const [area, setArea] = useState<AreaKey>("fifth_settlement");

  const data = SERIES[area];

  const { linePath, areaPath, first, last, changePct } = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = (W - PAD_X * 2) / (data.length - 1);
    const y = (v: number) => PAD_Y + (1 - (v - min) / range) * (H - PAD_Y * 2);
    const pts = data.map((v, i) => [PAD_X + i * stepX, y(v)] as const);
    const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const areaP = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - PAD_Y} L${pts[0][0].toFixed(1)},${H - PAD_Y} Z`;
    return {
      linePath: line,
      areaPath: areaP,
      first: data[0],
      last: data[data.length - 1],
      changePct: ((data[data.length - 1] - data[0]) / data[0]) * 100,
    };
  }, [data]);

  const rising = last >= first;

  return (
    <div>
      {/* Area selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {AREA_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setArea(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              area === key
                ? "bg-secondary text-secondary-foreground shadow-soft"
                : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            {t(`trend.areas.${key}`)}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">{t("trend.perSqm")}</div>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US").format(last)}
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${
              rising
                ? "bg-secondary/15 text-secondary"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {rising ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {rising ? t("trend.rising") : t("trend.falling")} (+{changePct.toFixed(1)}%)
          </div>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-44"
          role="img"
          aria-label={`${t(`trend.areas.${area}`)} — ${t("trend.last12Months")}`}
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.14 170)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="oklch(0.65 0.14 170)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={PAD_Y + f * (H - PAD_Y * 2)}
              y2={PAD_Y + f * (H - PAD_Y * 2)}
              stroke="currentColor"
              className="text-border"
              strokeDasharray="4 6"
            />
          ))}
          <path d={areaPath} fill="url(#trendFill)" />
          <path d={linePath} fill="none" stroke="oklch(0.65 0.14 170)" strokeWidth="2.5" strokeLinecap="round" />
          <circle
            cx={W - PAD_X}
            cy={PAD_Y + (1 - (last - Math.min(...data)) / ((Math.max(...data) - Math.min(...data)) || 1)) * (H - PAD_Y * 2)}
            r="5"
            fill="oklch(0.65 0.14 170)"
          />
        </svg>

        <div className="mt-2 text-xs text-muted-foreground text-center">{t("trend.last12Months")}</div>
      </div>
    </div>
  );
}
