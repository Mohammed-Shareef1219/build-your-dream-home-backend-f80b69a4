import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  TrendingUp,
  Scale,
  Wallet,
  CheckCircle2,
  Wind,
  Snowflake,
  Sun,
  Ruler,
  Sparkles,
  LineChart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { TYPES } from "@/data/propertyTypes";

/**
 * "Resources" deep-dive panel rendered inside the footer on every page.
 * Organizes the four Resources pillars (Real Estate Guides, Egyptian Market,
 * Valuation Tips, Smart Budgeting) and presents the property types of real
 * estate through the Function/Feeling/Future lens plus the Investment and
 * Building Sustainability insights from the Property Types page.
 */
export function FooterResources() {
  const { t } = useTranslation("common");
  const { t: tpt } = useTranslation("propertyTypes");
  const { t: tinfo } = useTranslation("info");

  const categories = [
    {
      icon: BookOpen,
      title: t("footer.resources.guides"),
      to: "/resources",
      text: tinfo("resources.guides.realEstateGuides.text"),
    },
    {
      icon: TrendingUp,
      title: t("footer.resources.egyptianMarket"),
      to: "/resources",
      text: tinfo("resources.guides.marketStudy.text"),
    },
    {
      icon: Scale,
      title: t("footer.resources.valuationTips"),
      to: "/resources",
      text: tinfo("resources.guides.smartTips.text"),
    },
    {
      icon: Wallet,
      title: t("footer.resources.smartBudgeting"),
      to: "/resources",
      text: tinfo("resources.guides.smartBudgeting.text"),
    },
  ];

  const concepts = [
    {
      icon: Ruler,
      title: tpt("conceptStrip.function.title"),
      body: tpt("conceptStrip.function.body"),
    },
    {
      icon: Sparkles,
      title: tpt("conceptStrip.feeling.title"),
      body: tpt("conceptStrip.feeling.body"),
    },
    {
      icon: LineChart,
      title: tpt("conceptStrip.future.title"),
      body: tpt("conceptStrip.future.body"),
    },
  ];

  return (
    <section
      aria-labelledby="footer-resources-heading"
      className="rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 p-6 md:p-8"
    >
      {/* Four Resources pillars */}
      <h3 id="footer-resources-heading" className="font-semibold text-lg mb-5">
        {t("footer.resources.title")}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="group rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-4 hover:bg-primary-foreground/10 transition-colors"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="size-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                <c.icon className="size-4" />
              </div>
              <h4 className="font-semibold text-sm group-hover:text-secondary transition-colors">
                {c.title}
              </h4>
            </div>
            <p className="text-xs text-primary-foreground/60 leading-relaxed line-clamp-3">
              {c.text}
            </p>
          </Link>
        ))}
      </div>

      {/* Function / Feeling / Future — how to read every typology */}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {concepts.map((c) => (
          <div key={c.title} className="flex gap-3">
            <div className="size-9 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
              <c.icon className="size-4.5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{c.title}</h4>
              <p className="text-xs text-primary-foreground/60 leading-relaxed mt-0.5">{c.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Investment Aspect — per property type */}
      <div className="mt-10">
        <div className="flex items-baseline gap-3 mb-5">
          <h4 className="font-semibold">{tpt("investment.eyebrow")}</h4>
          <span className="text-xs text-primary-foreground/50">
            — {t("footer.resources.byType")}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TYPES.map((type) => (
            <div
              key={type.slug}
              className="rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-4"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="size-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center shrink-0">
                  <type.icon className="size-4" />
                </div>
                <h5 className="font-semibold text-sm">{tpt(`types.${type.slug}.name`)}</h5>
              </div>
              <dl className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between border-b border-primary-foreground/10 pb-1.5">
                  <dt className="text-primary-foreground/60">
                    {tpt("investment.metrics.annualRoi")}
                  </dt>
                  <dd className="font-semibold text-accent">{type.roi}%</dd>
                </div>
                <div className="flex items-center justify-between border-b border-primary-foreground/10 pb-1.5">
                  <dt className="text-primary-foreground/60">
                    {tpt("investment.metrics.appreciation")}
                  </dt>
                  <dd className="font-semibold text-accent">{type.appreciation}%</dd>
                </div>
                <div className="flex items-center justify-between border-b border-primary-foreground/10 pb-1.5">
                  <dt className="text-primary-foreground/60">
                    {tpt("investment.metrics.rentYield")}
                  </dt>
                  <dd className="font-semibold text-accent">{type.rentYield}%</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-primary-foreground/60">
                    {tpt("investment.metrics.liquidity")}
                  </dt>
                  <dd className="font-semibold text-accent">
                    {tpt(`types.${type.slug}.liquidity`)}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>

      {/* Building Sustainability — per property type */}
      <div className="mt-10">
        <div className="flex items-baseline gap-3 mb-5">
          <h4 className="font-semibold">{tpt("sustainability.eyebrow")}</h4>
          <span className="text-xs text-primary-foreground/50">
            — {t("footer.resources.byType")}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TYPES.map((type) => (
            <div
              key={type.slug}
              className="rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-4"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="size-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                  <type.icon className="size-4" />
                </div>
                <h5 className="font-semibold text-sm">{tpt(`types.${type.slug}.name`)}</h5>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-primary-foreground/60 mb-2.5">
                <span className="flex items-center gap-1">
                  <Snowflake className="size-3" /> {tpt("sustainability.insulation")}{" "}
                  {type.insulation}/5
                </span>
                <span className="flex items-center gap-1">
                  <Sun className="size-3" /> {tpt("sustainability.naturalLight")}{" "}
                  {type.naturalLight}/5
                </span>
              </div>
              <p className="text-xs flex items-start gap-1.5 text-primary-foreground/75 mb-2.5">
                <Wind className="size-3.5 text-secondary shrink-0 mt-0.5" />
                <span>{tpt(`types.${type.slug}.acStrategy`)}</span>
              </p>
              <ul className="space-y-1">
                {(
                  tpt(`types.${type.slug}.sustainability`, { returnObjects: true }) as string[]
                ).map((s) => (
                  <li
                    key={s}
                    className="text-xs flex items-start gap-1.5 text-primary-foreground/70"
                  >
                    <CheckCircle2 className="size-3.5 text-secondary shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
