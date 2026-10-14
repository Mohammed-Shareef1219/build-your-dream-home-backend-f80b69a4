import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Phone, ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — BuildYourHome" },
      { name: "description", content: "Get in touch with BuildYourHome. Book a free consultation and get expert advice within 24 hours." },
      { property: "og:title", content: "Contact Us — BuildYourHome" },
      { property: "og:description", content: "Book a free consultation today." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useTranslation("consultation");
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <header className="text-center max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider">{t("contact.eyebrow")}</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">{t("contact.title")}</h1>
        <p className="mt-4 text-muted-foreground">
          {t("contact.subtitle")}
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-brand-gradient text-white p-8 shadow-elegant">
          <Sparkles className="h-7 w-7" />
          <h2 className="mt-3 text-2xl font-bold">{t("contact.bookTitle")}</h2>
          <p className="mt-2 text-white/85">{t("contact.bookText")}</p>
          <Link to="/consultation" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-primary px-6 py-3 font-semibold hover:opacity-90 transition">
            {t("contact.bookCta")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-soft">
          <h2 className="text-2xl font-bold">{t("contact.directTitle")}</h2>
          <ul className="mt-6 space-y-4">
            <li className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center"><Mail className="h-4 w-4" /></div>
              <a href="mailto:buildyourhom@gmail.com" className="font-medium hover:text-secondary transition-colors">buildyourhom@gmail.com</a>
            </li>
            <li className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center"><Phone className="h-4 w-4" /></div>
              <a href="tel:+20111639205" className="font-medium hover:text-secondary transition-colors">+20 111 639 205</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
