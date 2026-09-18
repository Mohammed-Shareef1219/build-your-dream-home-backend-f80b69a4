import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Home as HomeIcon, Wallet } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

/** Assumed financing model used for the instant estimate (matches market norms). */
const ANNUAL_RATE = 0.12; // 12% nominal, applied on declining balance of remaining installments
const AVG_UNIT_PRICE = 2_500_000; // representative listing price in EGP

export function BudgetPlanner({ properties }: { properties: Property[] }) {
  const { t } = useTranslation("home");
  // downPct: % of total price paid upfront; years: installment period
  const [downPct, setDownPct] = useState(20);
  const [years, setYears] = useState(5);

  const maxPrice = useMemo(
    () => properties.reduce((m, p) => Math.max(m, Number(p.price) || 0), 0),
    [properties]
  );

  const matches = useMemo(
    () =>
      properties
        .filter((p) => {
          const price = Number(p.price) || 0;
          if (!price) return false;
          const down = (price * downPct) / 100;
          if (down > 0 && down < price) {
            // The buyer can afford the down payment; remaining amount must be
            // payable within the selected installment window at market rates.
            const remaining = price - down;
            const yearly = (remaining * (1 + ANNUAL_RATE * years)) / years;
            const affordableYearly = ((AVG_UNIT_PRICE * (100 - downPct)) / 100 * (1 + ANNUAL_RATE * years)) / years;
            return yearly <= affordableYearly * 1.25;
          }
          return price <= AVG_UNIT_PRICE;
        })
        .slice(0, 3),
    [properties, downPct, years]
  );

  // Total budget the buyer commands with this plan (representative unit)
  const remainingBudget = AVG_UNIT_PRICE * (1 - downPct / 100);
  const totalBudget = Math.round(
    (AVG_UNIT_PRICE - remainingBudget + (remainingBudget * (1 + ANNUAL_RATE * years)) / years / (1 + ANNUAL_RATE * years) * years) / 10000
  ) * 10000;

  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div className="text-lg font-semibold">{t("budget.totalBudget")}</div>
          <div className="ms-auto text-xl font-bold text-primary">
            {fmt(totalBudget)} <span className="text-sm font-normal text-muted-foreground">EGP</span>
          </div>
        </div>

        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">{t("budget.downPayment")}</label>
            <span className="rounded-full bg-secondary/15 text-secondary text-sm font-bold px-3 py-1">
              {downPct}%
            </span>
          </div>
          <Slider
            value={[downPct]}
            onValueChange={([v]) => setDownPct(v)}
            min={5}
            max={100}
            step={5}
            aria-label={t("budget.downPayment")}
          />
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>5%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">{t("budget.installmentYears")}</label>
            <span className="rounded-full bg-secondary/15 text-secondary text-sm font-bold px-3 py-1">
              {t("budget.years", { count: years })}
            </span>
          </div>
          <Slider
            value={[years]}
            onValueChange={([v]) => setYears(v)}
            min={1}
            max={10}
            step={1}
            aria-label={t("budget.installmentYears")}
          />
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
          {matches.length === 1 ? t("budget.matchOne") : t("budget.matches", { count: matches.length })}
        </div>
      </div>

      <div>
        {matches.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
            <HomeIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
            {t("budget.matchZero")}
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((p) => {
              const img =
                p.image_urls?.[0] ??
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop";
              return (
                <Link
                  key={p.id}
                  to="/properties/$id"
                  params={{ id: p.id }}
                  className="group flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-0.5"
                >
                  <img
                    src={img}
                    alt={p.title}
                    loading="lazy"
                    className="h-24 w-32 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold line-clamp-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{p.location}</p>
                    <div className="mt-1.5 font-bold text-primary">
                      {fmt(Number(p.price))} {p.currency}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <Link
          to="/properties"
          search={{ type: "all", beds: "any", sort: "featured" }}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-soft hover:bg-secondary/90 transition"
        >
          {t("budget.browseMatches")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
