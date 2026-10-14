import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — BuildYourHome" },
      { name: "description", content: "How BuildYourHome uses cookies and similar technologies." },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  const { t } = useTranslation("legal");
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{t("cookies.title")}</h1>
      <p className="text-muted-foreground mt-2">{t("cookies.lastUpdated")}</p>

      <section className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
        <p>{t("cookies.intro")}</p>
        <h2 className="text-xl font-semibold text-foreground">{t("cookies.typesHeading")}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-foreground">{t("cookies.essential.label")}</strong> — {t("cookies.essential.text")}</li>
          <li><strong className="text-foreground">{t("cookies.analytics.label")}</strong> — {t("cookies.analytics.text")}</li>
          <li><strong className="text-foreground">{t("cookies.preferences.label")}</strong> — {t("cookies.preferences.text")}</li>
        </ul>
        <h2 className="text-xl font-semibold text-foreground">{t("cookies.choicesHeading")}</h2>
        <p>{t("cookies.choicesText")}</p>
      </section>
    </article>
  );
}
