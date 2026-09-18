import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy & Terms — BuildYourHome" },
      { name: "description", content: "Verified properties with transparent prices and no hidden fees. Read our full 50-clause privacy and terms policy." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useTranslation("legal");
  const clauses = t("privacy.clauses", { returnObjects: true }) as string[];

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <header className="text-center max-w-2xl mx-auto">
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider">{t("privacy.eyebrow")}</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">{t("privacy.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("privacy.lastUpdated")}</p>
      </header>

      {/* Marketing trust boards */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border-l-4 border-secondary bg-secondary/10 p-6 shadow-soft flex items-start gap-3">
          <BadgeCheck className="h-6 w-6 text-secondary mt-0.5" />
          <p className="font-medium">{t("privacy.boards.verified")}</p>
        </div>
        <div className="rounded-2xl border-l-4 border-accent bg-accent/10 p-6 shadow-soft flex items-start gap-3">
          <Shield className="h-6 w-6 text-accent-foreground mt-0.5" />
          <p className="font-medium">{t("privacy.boards.bestDeals")}</p>
        </div>
      </div>

      {/* 50 clauses */}
      <ol className="mt-12 space-y-4 list-decimal list-inside text-muted-foreground leading-relaxed">
        {clauses.map((c, i) => (
          <li key={i} className="pl-2">
            <span className="text-foreground">{c}</span>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">{t("privacy.agreement")}</p>
        <button className="mt-4 rounded-full bg-secondary text-secondary-foreground px-8 py-2.5 font-semibold hover:opacity-90 transition">
          {t("privacy.agreeButton")}
        </button>
      </div>
    </article>
  );
}
