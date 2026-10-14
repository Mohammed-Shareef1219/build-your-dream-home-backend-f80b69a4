import { createFileRoute } from "@tanstack/react-router";
import { PropertyRequestForm } from "@/components/PropertyRequestForm";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/request-property")({
  head: () => ({
    meta: [
      { title: "Request a Property — BuildYourHome" },
      {
        name: "description",
        content:
          "Can't find what you're looking for? Send us a property request with the type and code you want and our team will follow up.",
      },
      { property: "og:title", content: "Request a Property — BuildYourHome" },
      { property: "og:description", content: "Tell us the property you need and we'll find it." },
    ],
  }),
  component: RequestPropertyPage,
});

function RequestPropertyPage() {
  const { t } = useTranslation("propertyRequest");
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <header className="text-center max-w-3xl mx-auto mb-10">
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider">
          {t("page.eyebrow")}
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">{t("page.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("page.subtitle")}</p>
      </header>
      <PropertyRequestForm />
    </div>
  );
}
