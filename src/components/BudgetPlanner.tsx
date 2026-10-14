import { useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type Property = Database["public"]["Tables"]["properties"]["Row"];

const MIN_BUDGET = 40_000;
const MAX_BUDGET = 300_000_000;

function formatEGP(v: number) {
  return v.toLocaleString("en-US");
}

export function BudgetPlanner() {
  const { t } = useTranslation("home");
  const [budget, setBudget] = useState<number[]>([400_000]);
  const [downPct, setDownPct] = useState<number[]>([20]);
  const [years, setYears] = useState<number[]>([5]);
  const [matches, setMatches] = useState<Property[] | null>(null);
  const [loading, setLoading] = useState(false);

  const total = budget[0];
  const down = Math.round((total * downPct[0]) / 100);
  const loan = total - down;
  const months = years[0] * 12;
  // Flat (declining-balance-free) estimate commonly used by Egyptian developers.
  const monthly = Math.round(loan / months);

  const label = useMemo(
    () => `${formatEGP(down)} – ${formatEGP(total)} EGP`,
    [down, total]
  );

  const isMatch = (p: Property) => {
    const price = Number(p.price) || 0;
    // Down payment affordable (<= chosen down) and monthly within a loose margin.
    const pMonthly = (price - price * 0.1) / 60;
    return price * 0.2 <= down + 1 && pMonthly <= monthly * 1.15 && price <= total * 1.05;
  };

  const findMatches = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("properties")
      .select("*")
      .gte("price", Math.max(MIN_BUDGET, down * 0.5))
      .lte("price", MAX_BUDGET)
      .order("price", { ascending: true })
      .limit(50);
    setMatches((data ?? []).filter(isMatch) as Property[]);
    setLoading(false);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] items-start">
        {/* Planner controls */}
        <div className="rounded-3xl bg-card p-6 sm:p-8 shadow-soft hover:shadow-elegant transition-all">
          <div className="h-12 w-12 rounded-xl bg-brand-gradient flex items-center justify-center mb-4 shadow-glow">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">{t("budget.heading")}</h2>
          <p className="mt-3 text-muted-foreground">{t("budget.sub")}</p>

          {/* Budget */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t("budget.totalBudget")}</span>
              <span className="text-sm font-semibold">{label}</span>
            </div>
            <Slider
              value={budget}
              onValueChange={setBudget}
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={10_000}
              aria-label={t("budget.totalBudget")}
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground" dir="ltr">
              <span>40,000</span>
              <span>300,000,000</span>
            </div>
          </div>

          {/* Down payment */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t("budget.downPayment")}</span>
              <span className="text-sm font-semibold">{downPct[0]}%</span>
            </div>
            <Slider
              value={downPct}
              onValueChange={setDownPct}
              min={5}
              max={100}
              step={5}
              aria-label={t("budget.downPayment")}
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground" dir="ltr">
              <span>5%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Years */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t("budget.installmentPeriod")}</span>
              <span className="text-sm font-semibold">
                {years[0]} {t("budget.years")}
              </span>
            </div>
            <Slider
              value={years}
              onValueChange={setYears}
              min={1}
              max={10}
              step={1}
              aria-label={t("budget.installmentPeriod")}
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground" dir="ltr">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-muted/50 p-4 text-sm">
            <div className="flex justify-between py-0.5">
              <span className="text-muted-foreground">{t("budget.monthly")}</span>
              <span className="font-semibold">{formatEGP(monthly)} EGP</span>
            </div>
          </div>

          <Button className="w-full mt-6" size="lg" onClick={findMatches} disabled={loading}>
            {loading ? t("budget.searching") : t("budget.cta")}
          </Button>
        </div>

        {/* Results */}
        <div>
          {matches === null ? (
            <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center h-full min-h-56 flex flex-col items-center justify-center">
              <p className="text-muted-foreground max-w-sm">{t("budget.hint")}</p>
            </div>
          ) : matches.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {matches.length} {t("budget.matchCount")}
                </h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 max-h-[720px] overflow-y-auto pr-1">
                {matches.map((p) => (
                  <PropertyCard key={p.id} property={p} isFavorite={false} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline" asChild>
                  <Link to="/properties" search={{ type: "all", q: "", beds: "any", sort: "price_asc", deal: "sale", category: "residential" }}>
                    {t("budget.browseAll")} →
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center h-full min-h-56 flex flex-col items-center justify-center">
              <p className="font-medium">{t("budget.noMatchTitle")}</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">{t("budget.noMatchHint")}</p>
              <Button variant="outline" className="mt-6" asChild>
                <Link to="/properties">{t("budget.browseAll")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
