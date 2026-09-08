import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import montCityImg from "@/assets/land-mont-city.jpg";
import mountAgibaImg from "@/assets/land-mount-agiba-2.jpg";

const PARTNERS = [
  { key: "montCity", image: montCityImg, code: "IB-2026-A1" },
  { key: "mountAgiba", image: mountAgibaImg, code: "IB-2026-A2" },
] as const;

export function PartnerDevelopers() {
  const { t } = useTranslation("home");

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 text-secondary font-semibold text-sm uppercase tracking-wider">
          <BadgeCheck className="h-4 w-4" /> {t("partnerCards.eyebrow")}
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mt-3">{t("partnerCards.heading")}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {PARTNERS.map((p) => (
          <article
            key={p.key}
            className="group rounded-3xl overflow-hidden bg-card shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
              <img
                src={p.image}
                alt={t(`partnerCards.${p.key}.title`)}
                loading="lazy"
                width={1200}
                height={675}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-4 start-4 bg-accent text-accent-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-soft">
                {t("partnerCards.badge")}
              </span>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold">{t(`partnerCards.${p.key}.title`)}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed flex-1">
                {t(`partnerCards.${p.key}.desc`)}
              </p>
              <div className="mt-6">
                <Button asChild variant="brand">
                  <Link to="/catalog/$slug/$code" params={{ slug: "land", code: p.code }}>
                    {t("partnerCards.explore")} <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
