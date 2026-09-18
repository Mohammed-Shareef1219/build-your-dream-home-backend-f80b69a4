import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck2, Home, Car, Trees, TrendingUp, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/investment")({
  head: () => ({
    meta: [
      { title: "Real Estate Investment — BuildYourHome" },
      { name: "description", content: "Generate income through rental properties, garages, and palm groves. Plus legal verification for every deal." },
      { property: "og:title", content: "Real Estate Investment — BuildYourHome" },
      { property: "og:description", content: "Earn from rentals, garages, and palm groves across Egypt." },
    ],
  }),
  component: InvestmentPage,
});

const strategies = [
  { key: "residential", icon: Home },
  { key: "garage", icon: Car },
  { key: "palm", icon: Trees },
  { key: "commercial", icon: TrendingUp },
];

function InvestmentPage() {
  const { t } = useTranslation("info");
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      <header className="text-center max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider">{t("investment.eyebrow")}</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">{t("investment.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("investment.subtitle")}</p>
      </header>

      {/* Legal verification board */}
      <div className="mt-10 rounded-2xl border-l-4 border-accent bg-accent/10 p-6 shadow-soft flex items-start gap-3">
        <FileCheck2 className="h-6 w-6 text-accent-foreground mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold">{t("investment.legal.heading")}</h2>
          <p className="mt-1 text-muted-foreground">{t("investment.legal.text")}</p>
        </div>
      </div>

      {/* Strategies */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {strategies.map((s) => (
          <div key={s.key} className="rounded-2xl border bg-card p-6 shadow-soft hover:shadow-elegant transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-brand-gradient text-white flex items-center justify-center">
              <s.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">{t(`investment.strategies.${s.key}.title`)}</h3>
            <p className="mt-1 text-xs text-secondary font-medium uppercase tracking-wider">{t(`investment.strategies.${s.key}.location`)}</p>
            <p className="mt-2 text-muted-foreground leading-relaxed">{t(`investment.strategies.${s.key}.text`)}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border bg-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-secondary mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg">{t("investment.advisor.title")}</h3>
            <p className="text-muted-foreground text-sm">{t("investment.advisor.text")}</p>
          </div>
        </div>
        <Link to="/consultation" className="rounded-full bg-secondary text-secondary-foreground px-6 py-2.5 font-semibold hover:opacity-90 transition">
          {t("investment.advisor.button")}
        </Link>
      </div>
    </div>
  );
}
