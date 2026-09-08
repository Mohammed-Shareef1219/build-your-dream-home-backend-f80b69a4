import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const PLANS = [
  { key: "trial", highlight: false },
  { key: "quarter", highlight: true },
  { key: "half", highlight: false },
] as const;

export function PricingPackages() {
  const { t } = useTranslation("home");

  return (
    <section className="bg-muted/30 border-y py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 text-secondary font-semibold text-sm uppercase tracking-wider">
            <Sparkles className="h-4 w-4" /> {t("packages.eyebrow")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-3">{t("packages.heading")}</h2>
          <p className="text-muted-foreground text-lg">{t("packages.subheading")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {PLANS.map((plan) => {
            const features = t(`packages.${plan.key}.features`, { returnObjects: true }) as string[];
            return (
              <div
                key={plan.key}
                className={`relative rounded-3xl p-8 flex flex-col shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant ${
                  plan.highlight ? "bg-secondary text-secondary-foreground" : "bg-card"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 start-8 bg-accent text-accent-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-soft">
                    {t("packages.popular")}
                  </span>
                )}
                <h3 className="text-xl font-bold">{t(`packages.${plan.key}.name`)}</h3>
                <p className={`mt-1 text-sm ${plan.highlight ? "text-secondary-foreground/80" : "text-muted-foreground"}`}>
                  {t(`packages.${plan.key}.tagline`)}
                </p>
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-4xl font-extrabold">{t(`packages.${plan.key}.price`)}</span>
                  <span className={`pb-1.5 text-sm ${plan.highlight ? "text-secondary-foreground/80" : "text-muted-foreground"}`}>
                    {t(`packages.${plan.key}.period`)}
                  </span>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`size-4 shrink-0 mt-0.5 ${plan.highlight ? "text-accent" : "text-secondary"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.highlight ? "accent" : "brand"}
                  className="mt-8"
                >
                  <Link to="/consultation">
                    {t(`packages.${plan.key}.cta`)} <ArrowRight />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
