import { createFileRoute } from "@tanstack/react-router";
import { Newspaper, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog & News — BuildYourHome" },
      { name: "description", content: "Latest real estate updates, market insights, and platform news from BuildYourHome." },
      { property: "og:title", content: "Blog & News — BuildYourHome" },
      { property: "og:description", content: "Latest real estate updates and platform news." },
    ],
  }),
  component: BlogPage,
});

const news = [
  { key: "cairoMarket", date: "June 2026" },
  { key: "aiTool", date: "May 2026" },
  { key: "agentAhmed", date: "May 2026" },
  { key: "ibnBeitak", date: "Apr 2026" },
  { key: "sheikhZayed", date: "Apr 2026" },
  { key: "smartTours", date: "Mar 2026" },
];

function BlogPage() {
  const { t } = useTranslation("info");
  const ticker = t("blog.ticker", { returnObjects: true }) as string[];

  return (
    <div>
      {/* Ticker */}
      <div className="bg-primary text-primary-foreground overflow-hidden">
        <div className="flex whitespace-nowrap py-3 animate-[ticker_50s_linear_infinite] text-sm font-medium">
          {[...ticker, ...ticker].map((tItem, i) => (
            <span key={i} className="px-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />{tItem}
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <header className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider">{t("blog.eyebrow")}</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">{t("blog.title")}</h1>
        </header>

        <div className="mt-10 rounded-2xl border-l-4 border-secondary bg-secondary/10 p-6 shadow-soft flex items-start gap-3">
          <Newspaper className="h-6 w-6 text-secondary mt-0.5" />
          <p className="text-lg font-medium">{t("blog.banner")}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <article key={n.key} className="rounded-2xl border bg-card p-6 shadow-soft hover:shadow-elegant transition-shadow">
              <div className="flex items-center gap-2 text-xs text-secondary font-semibold uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5" /> {t(`blog.news.${n.key}.tag`)}
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-snug">{t(`blog.news.${n.key}.title`)}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{n.date}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
