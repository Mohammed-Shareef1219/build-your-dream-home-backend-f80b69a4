import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, Sparkles, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — BuildYourHome" },
      { name: "description", content: "Brokers + programmers, powered by technology. Learn about BuildYourHome's mission, vision, and aspiration." },
      { property: "og:title", content: "About Us — BuildYourHome" },
      { property: "og:description", content: "Brokers + programmers, powered by technology." },
    ],
  }),
  component: AboutPage,
});

const blocks = [
  { key: "goal", icon: Target },
  { key: "vision", icon: Eye },
  { key: "futureVision", icon: Sparkles },
  { key: "aspiration", icon: Rocket },
];

function AboutPage() {
  const { t } = useTranslation("info");
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      <header className="text-center max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider">{t("about.eyebrow")}</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">{t("about.title")}</h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{t("about.intro")}</p>
      </header>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {blocks.map((b) => (
          <div key={b.key} className="rounded-2xl border bg-card p-6 shadow-soft hover:shadow-elegant transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-brand-gradient text-white flex items-center justify-center">
              <b.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">{t(`about.blocks.${b.key}.title`)}</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">{t(`about.blocks.${b.key}.text`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
