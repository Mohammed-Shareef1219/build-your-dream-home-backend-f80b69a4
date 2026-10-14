import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Calculator, Wallet, TrendingUp, LineChart } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources & Real Estate Guides — BuildYourHome" },
      { name: "description", content: "Real estate guides, smart valuation tips, and an Egyptian market study program from BuildYourHome experts." },
      { property: "og:title", content: "Resources & Real Estate Guides — BuildYourHome" },
      { property: "og:description", content: "Learn best practices in buying and investing in real estate." },
    ],
  }),
  component: ResourcesPage,
});

const guides = [
  { key: "realEstateGuides", icon: BookOpen },
  { key: "marketStudy", icon: GraduationCap },
  { key: "smartTips", icon: Calculator },
  { key: "smartBudgeting", icon: Wallet },
];

const curriculumKeys = ["week1", "week2", "week3", "week4"];

function ResourcesPage() {
  const { t } = useTranslation("info");
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      <header className="text-center max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider">{t("resources.eyebrow")}</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">{t("resources.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("resources.subtitle")}</p>
      </header>

      {/* Featured board */}
      <div className="mt-10 rounded-2xl border-l-4 border-secondary bg-secondary/10 p-6 shadow-soft flex items-start gap-3">
        <LineChart className="h-6 w-6 text-secondary mt-0.5" />
        <p className="text-lg font-medium">{t("resources.banner")}</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {guides.map((g) => (
          <div key={g.key} className="rounded-2xl border bg-card p-6 shadow-soft hover:shadow-elegant transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-brand-gradient text-white flex items-center justify-center">
              <g.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">{t(`resources.guides.${g.key}.title`)}</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">{t(`resources.guides.${g.key}.text`)}</p>
          </div>
        ))}
      </div>

      {/* Curriculum */}
      <section className="mt-16">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-secondary" />
          <h2 className="text-2xl font-bold">{t("resources.curriculumHeading")}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {curriculumKeys.map((c) => (
            <div key={c} className="rounded-xl border bg-card p-5">
              <div className="text-xs font-semibold text-secondary uppercase tracking-wider">{t(`resources.curriculum.${c}.week`)}</div>
              <h3 className="mt-1 font-semibold text-lg">{t(`resources.curriculum.${c}.topic`)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(`resources.curriculum.${c}.detail`)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
