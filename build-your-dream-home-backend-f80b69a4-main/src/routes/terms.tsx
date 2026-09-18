import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — BuildYourHome" },
      { name: "description", content: "The terms and conditions governing your use of BuildYourHome." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useTranslation("legal");
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{t("terms.title")}</h1>
      <p className="text-muted-foreground mt-2">{t("terms.lastUpdated")}</p>

      <section className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
        <p>{t("terms.intro")}</p>
        <h2 className="text-xl font-semibold text-foreground">{t("terms.useOfService.heading")}</h2>
        <p>{t("terms.useOfService.text")}</p>
        <h2 className="text-xl font-semibold text-foreground">{t("terms.listings.heading")}</h2>
        <p>{t("terms.listings.text")}</p>
        <h2 className="text-xl font-semibold text-foreground">{t("terms.liability.heading")}</h2>
        <p>{t("terms.liability.text")}</p>
      </section>
    </article>
  );
}
