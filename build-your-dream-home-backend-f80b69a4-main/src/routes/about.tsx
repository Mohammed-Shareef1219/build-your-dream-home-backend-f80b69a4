import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Target,
  Eye,
  Rocket,
  Sparkles,
  Shield,
  Zap,
  Brain,
  Users,
  Clock,
  PiggyBank,
  Smile,
  UserPlus,
  LayoutGrid,
  Settings2,
  FileCheck2,
  HardHat,
  MapPin,
  Wallet,
  Hammer,
  Globe,
  TrendingUp,
  Timer,
  Filter,
  IdCard,
  Gift,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — BuildYourHome" },
      {
        name: "description",
        content:
          "Brokers + programmers, powered by technology. Learn about BuildYourHome's mission, vision, and aspiration.",
      },
      { property: "og:title", content: "About Us — BuildYourHome" },
      { property: "og:description", content: "Brokers + programmers, powered by technology." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useTranslation("home");
  const { t: ti } = useTranslation("info");

  return (
    <div>
      {/* ===== About header + mission blocks (existing About content) ===== */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <header className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider">
            {ti("about.eyebrow")}
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">{ti("about.title")}</h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{ti("about.intro")}</p>
        </header>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {(
            [
              { key: "goal", icon: Target },
              { key: "vision", icon: Eye },
              { key: "futureVision", icon: Rocket },
              { key: "aspiration", icon: Sparkles },
            ] as const
          ).map((b) => (
            <div
              key={b.key}
              className="rounded-2xl border bg-card p-6 shadow-soft hover:shadow-elegant transition-shadow"
            >
              <div className="h-11 w-11 rounded-xl bg-brand-gradient text-white flex items-center justify-center">
                <b.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">{ti(`about.blocks.${b.key}.title`)}</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {ti(`about.blocks.${b.key}.text`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Value props ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { key: "curated", icon: Sparkles },
            { key: "trusted", icon: Shield },
            { key: "fast", icon: Zap },
          ].map((f) => (
            <div
              key={f.key}
              className="rounded-2xl bg-card p-8 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <div className="h-12 w-12 rounded-xl bg-brand-gradient flex items-center justify-center mb-4 shadow-glow">
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t(`valueProps.${f.key}.title`)}</h3>
              <p className="text-muted-foreground">{t(`valueProps.${f.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Who We Are ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-secondary font-semibold mb-3">
              <Zap className="h-4 w-4" /> {t("whoWeAre.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-5">
              {t("whoWeAre.titlePrefix")}{" "}
              <span className="text-secondary">{t("whoWeAre.titleHighlight")}</span>.
            </h2>
            <p
              className="text-muted-foreground text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t("whoWeAre.description") }}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: "goal", icon: Target },
              { key: "vision", icon: Eye },
              { key: "futureVision", icon: Rocket },
              { key: "aspiration", icon: Sparkles },
            ].map((c) => (
              <div
                key={c.key}
                className="rounded-2xl bg-card p-6 shadow-soft hover:shadow-elegant transition-all"
              >
                <c.icon className="h-7 w-7 text-secondary mb-3" />
                <h3 className="font-semibold mb-1.5">{t(`whoWeAre.${c.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`whoWeAre.${c.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Platform Features ===== */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-secondary font-semibold mb-3">
              <Sparkles className="h-4 w-4" /> {t("features.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("features.heading")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("features.subheading")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(
              [
                { key: "maps", icon: Globe },
                { key: "trend", icon: TrendingUp },
                { key: "budget", icon: Wallet },
                { key: "upload", icon: Timer },
                { key: "trial", icon: Gift },
                { key: "filtering", icon: Filter },
                { key: "portfolio", icon: IdCard },
              ] as const
            ).map((f) => (
              <div
                key={f.key}
                className="rounded-2xl bg-card p-6 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-xl bg-brand-gradient flex items-center justify-center mb-4 shadow-glow">
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1.5">{t(`features.${f.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`features.${f.key}.desc`)}
                </p>
              </div>
            ))}
            {/* 7 features + 1 CTA tile to complete the grid */}
            <Link
              to="/consultation"
              className="rounded-2xl bg-brand-gradient text-white p-6 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <HardHat className="h-8 w-8 mb-4 text-accent" />
              <div>
                <h3 className="font-semibold mb-1.5">{t("cta.heading")}</h3>
                <p className="text-sm text-white/85 leading-relaxed">{t("cta.subheading")}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-accent font-medium text-sm">
                  {t("cta.book")} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Real Estate Tips ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("tips.heading")}</h2>
          <p className="text-muted-foreground text-lg">{t("tips.subheading")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { key: "location", icon: MapPin },
            { key: "valuation", icon: Wallet },
            { key: "legal", icon: Hammer },
          ].map((tip) => (
            <div
              key={tip.key}
              className="rounded-2xl bg-card p-8 shadow-soft hover:shadow-elegant transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-4">
                <tip.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t(`tips.${tip.key}.title`)}</h3>
              <p className="text-muted-foreground leading-relaxed">{t(`tips.${tip.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Start Searching — steps ===== */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("steps.heading")}</h2>
            <p className="text-muted-foreground text-lg">{t("steps.subheading")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: 1, key: "createAccount", icon: UserPlus },
              { n: 2, key: "browseListings", icon: LayoutGrid },
              { n: 3, key: "scheduleTour", icon: Settings2 },
              { n: 4, key: "closeDeal", icon: FileCheck2 },
            ].map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl bg-card p-7 shadow-soft hover:shadow-elegant transition-all"
              >
                <div className="absolute -top-4 left-7 h-9 w-9 rounded-full bg-brand-gradient text-white font-bold flex items-center justify-center shadow-glow">
                  {s.n}
                </div>
                <s.icon className="h-7 w-7 text-secondary mt-4 mb-3" />
                <h3 className="font-semibold mb-1.5">{t(`steps.${s.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`steps.${s.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Client Consultation ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            {t("consultationSection.heading")}
          </h2>
          <p className="text-muted-foreground text-lg">{t("consultationSection.subheading")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { key: "personalized", icon: Users },
            { key: "smartValuation", icon: Brain },
            { key: "transparency", icon: Shield },
          ].map((c) => (
            <div
              key={c.key}
              className="rounded-2xl bg-card p-8 shadow-soft hover:shadow-elegant transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-brand-gradient flex items-center justify-center mb-4 shadow-glow">
                <c.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t(`consultationSection.${c.key}.title`)}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(`consultationSection.${c.key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Why Choose Us ===== */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("whyChooseUs.heading")}</h2>
            <p className="text-muted-foreground text-lg">{t("whyChooseUs.subheading")}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { key: "technology", icon: Brain },
              { key: "humanSupport", icon: Users },
              { key: "saveTime", icon: Clock },
              { key: "saveMoney", icon: PiggyBank },
              { key: "uniqueExperience", icon: Smile },
              { key: "verifiedListings", icon: Sparkles },
            ].map((f) => (
              <div
                key={f.key}
                className="rounded-2xl bg-card p-6 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1"
              >
                <f.icon className="h-7 w-7 text-secondary mb-3" />
                <h3 className="font-semibold mb-1.5">{t(`whyChooseUs.${f.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`whyChooseUs.${f.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Free Consultation CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-brand-gradient p-12 md:p-16 text-center shadow-elegant">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("cta.heading")}</h2>
          <p className="text-white/85 text-lg mb-8 max-w-2xl mx-auto">{t("cta.subheading")}</p>
          <Button variant="accent" size="xl" asChild>
            <Link to="/consultation">
              {t("cta.book")} <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
