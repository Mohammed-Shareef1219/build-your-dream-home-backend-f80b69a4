import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Store, Car, Trees, Building2, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/neighborhoods")({
  head: () => ({
    meta: [
      { title: "Neighborhood Directory — BuildYourHome" },
      { name: "description", content: "Explore Egypt's top neighborhoods: commercial spaces, garages, gardens, services, and infrastructure for every area." },
      { property: "og:title", content: "Neighborhood Directory — BuildYourHome" },
      { property: "og:description", content: "The right location increases the value of your investment." },
    ],
  }),
  component: NeighborhoodsPage,
});

const areaKeys = ["newCairo", "october", "sheikhZayed", "northCoast", "maadi", "heliopolis"];

function NeighborhoodsPage() {
  const { t } = useTranslation("info");
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      <header className="text-center max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider">{t("neighborhoods.eyebrow")}</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">{t("neighborhoods.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("neighborhoods.subtitle")}</p>
      </header>

      <div className="mt-12 space-y-6">
        {areaKeys.map((a) => (
          <article key={a} className="rounded-2xl border bg-card p-6 shadow-soft hover:shadow-elegant transition-shadow">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold">{t(`neighborhoods.areas.${a}.name`)}</h2>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-secondary" /> {t(`neighborhoods.areas.${a}.location`)}
                </div>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <Spec icon={Store} label={t("neighborhoods.specs.commercial")} text={t(`neighborhoods.areas.${a}.commercial`)} />
              <Spec icon={Car} label={t("neighborhoods.specs.garages")} text={t(`neighborhoods.areas.${a}.garages`)} />
              <Spec icon={Trees} label={t("neighborhoods.specs.gardens")} text={t(`neighborhoods.areas.${a}.gardens`)} />
              <Spec icon={Building2} label={t("neighborhoods.specs.services")} text={t(`neighborhoods.areas.${a}.services`)} />
              <Spec icon={Wrench} label={t("neighborhoods.specs.infrastructure")} text={t(`neighborhoods.areas.${a}.infrastructure`)} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Spec({ icon: Icon, label, text }: { icon: typeof Store; label: string; text: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
      <div>
        <div className="font-semibold">{label}</div>
        <p className="text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
