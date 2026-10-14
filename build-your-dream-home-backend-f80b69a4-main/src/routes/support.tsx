import { createFileRoute, Link } from "@tanstack/react-router";
import { UserPlus, Search, CalendarCheck, Handshake } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Help Center & Support — BuildYourHome" },
      { name: "description", content: "Learn how to use BuildYourHome — from creating your account to closing a deal." },
      { property: "og:title", content: "Help Center & Support — BuildYourHome" },
      { property: "og:description", content: "Step-by-step guide to finding your dream property." },
    ],
  }),
  component: SupportPage,
});

const steps = [
  { key: "createAccount", icon: UserPlus },
  { key: "browseListings", icon: Search },
  { key: "scheduleTour", icon: CalendarCheck },
  { key: "closeDeal", icon: Handshake },
];

function SupportPage() {
  const { t } = useTranslation("info");
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <header className="text-center max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider">{t("support.eyebrow")}</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">{t("support.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("support.subtitle")}</p>
      </header>

      <ol className="mt-14 relative space-y-8 before:absolute before:left-6 before:top-0 before:bottom-0 before:w-px before:bg-border md:before:left-1/2">
        {steps.map((s, i) => (
          <li key={s.key} className={`relative md:grid md:grid-cols-2 md:gap-12 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div className="pl-16 md:pl-0 md:text-right md:pr-12">
              <div className="text-sm font-semibold text-secondary">{t("support.stepLabel", { number: i + 1 })}</div>
              <h2 className="mt-1 text-2xl font-bold">{t(`support.steps.${s.key}.title`)}</h2>
              <p className="mt-2 text-muted-foreground">{t(`support.steps.${s.key}.text`)}</p>
            </div>
            <div className="hidden md:block" />
            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-0 h-12 w-12 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-elegant">
              <s.icon className="h-5 w-5" />
            </div>
          </li>
        ))}
      </ol>

      {/* Quick contact channels */}
      <section className="mt-16 grid gap-4 md:grid-cols-3">
        <a href="https://wa.me/20111639205" target="_blank" rel="noopener noreferrer" className="rounded-2xl border bg-card p-5 hover:shadow-elegant transition-shadow">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wider">{t("support.contact.whatsapp.label")}</div>
          <div className="mt-1 font-semibold">+20 111 639 205</div>
          <p className="mt-1 text-sm text-muted-foreground">{t("support.contact.whatsapp.note")}</p>
        </a>
        <a href="https://t.me/+20111639205" target="_blank" rel="noopener noreferrer" className="rounded-2xl border bg-card p-5 hover:shadow-elegant transition-shadow">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wider">{t("support.contact.telegram.label")}</div>
          <div className="mt-1 font-semibold">+20 111 639 205</div>
          <p className="mt-1 text-sm text-muted-foreground">{t("support.contact.telegram.note")}</p>
        </a>
        <a href="mailto:buildyourhom@gmail.com" className="rounded-2xl border bg-card p-5 hover:shadow-elegant transition-shadow">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wider">{t("support.contact.email.label")}</div>
          <div className="mt-1 font-semibold">buildyourhom@gmail.com</div>
          <p className="mt-1 text-sm text-muted-foreground">{t("support.contact.email.note")}</p>
        </a>
      </section>

      <div className="mt-12 text-center">
        <Link to="/consultation" className="inline-flex rounded-full bg-secondary text-secondary-foreground px-8 py-3 font-semibold hover:opacity-90 transition">
          {t("support.bookConsultation")}
        </Link>
      </div>
    </div>
  );
}
