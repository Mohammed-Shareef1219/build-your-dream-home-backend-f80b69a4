import { Link } from "@tanstack/react-router";
import { Mail, Phone, Facebook, Instagram, Twitter, Linkedin, Send, MessageCircle, Music2, Shield, BadgeCheck, ArrowRight, UserPlus, Search, CalendarCheck, Handshake } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.png";

const tickerKeys = [
  "cairoMarket",
  "agentAhmed",
  "aiValuationTool",
  "newCairoVillas",
  "octoberDemand",
  "sheikhZayedCommercial",
  "northCoastRentals",
  "maadiDuplex",
  "mortgageRates",
  "aiMatched",
  "fifthSettlement",
  "ibnBeitak",
  "smartTours",
] as const;

const steps = [
  { icon: UserPlus, key: "createAccount" },
  { icon: Search, key: "browseListings" },
  { icon: CalendarCheck, key: "scheduleTour" },
  { icon: Handshake, key: "closeDeal" },
] as const;

const socials = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Send, label: "Telegram", href: "https://t.me/+20111639205" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: Music2, label: "TikTok", href: "https://tiktok.com" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/20111639205" },
] as const;

export function Footer() {
  const { t } = useTranslation("common");

  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      {/* Live ticker */}
      <div className="bg-secondary/95 text-secondary-foreground overflow-hidden border-b border-primary-foreground/10">
        <div className="flex whitespace-nowrap animate-[ticker_60s_linear_infinite] py-2.5 text-sm font-medium">
          {[...tickerKeys, ...tickerKeys].map((key, i) => (
            <span key={i} className="px-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t(`footer.ticker.${key}`)}
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-14">
        {/* Brand + Explore + Contact + Follow */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="BuildYourHome logo" width={40} height={40} className="h-10 w-10 object-contain" loading="lazy" />
              <span className="font-display text-2xl font-bold tracking-tight">{t("brand")}</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <FooterCol title={t("footer.explore.title")}>
            <FooterLink to="/property-types">{t("footer.explore.propertyTypes")}</FooterLink>
            <FooterLink to="/gallery">{t("footer.explore.designGallery")}</FooterLink>
            <FooterLink to="/properties">{t("footer.explore.listings")}</FooterLink>
            <FooterLink to="/consultation">{t("footer.explore.freeConsultation")}</FooterLink>
          </FooterCol>

          <div>
            <h3 className="font-semibold mb-4">{t("footer.contact.title")}</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>buildyourhom@gmail.com</span></li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>+20111639205</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footer.follow.title")}</h3>
            <div className="flex flex-wrap gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Main navigation sections */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 pt-10 border-t border-primary-foreground/10">
          <FooterCol title={t("footer.aboutUs.title")}>
            <FooterLink to="/about">{t("footer.aboutUs.whoWeAre")}</FooterLink>
            <FooterLink to="/about">{t("footer.aboutUs.ourGoal")}</FooterLink>
            <FooterLink to="/about">{t("footer.aboutUs.ourVision")}</FooterLink>
            <FooterLink to="/about">{t("footer.aboutUs.ambition")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("footer.careers.title")}>
            <FooterLink to="/careers">{t("footer.careers.joinTeam")}</FooterLink>
            <FooterLink to="/careers">{t("footer.careers.brokers")}</FooterLink>
            <FooterLink to="/careers">{t("footer.careers.salesTeam")}</FooterLink>
            <FooterLink to="/careers">{t("footer.careers.aiEngineers")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("footer.blog.title")}>
            <FooterLink to="/blog">{t("footer.blog.marketUpdates")}</FooterLink>
            <FooterLink to="/blog">{t("footer.blog.platformNews")}</FooterLink>
            <FooterLink to="/blog">{t("footer.blog.agentListings")}</FooterLink>
            <FooterLink to="/blog">{t("footer.blog.localPrices")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("footer.resources.title")}>
            <FooterLink to="/resources">{t("footer.resources.guides")}</FooterLink>
            <FooterLink to="/resources">{t("footer.resources.egyptianMarket")}</FooterLink>
            <FooterLink to="/resources">{t("footer.resources.valuationTips")}</FooterLink>
            <FooterLink to="/resources">{t("footer.resources.smartBudgeting")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("footer.neighborhoods.title")}>
            <FooterLink to="/neighborhoods">{t("footer.neighborhoods.newCairo")}</FooterLink>
            <FooterLink to="/neighborhoods">{t("footer.neighborhoods.october")}</FooterLink>
            <FooterLink to="/neighborhoods">{t("footer.neighborhoods.sheikhZayed")}</FooterLink>
            <FooterLink to="/neighborhoods">{t("footer.neighborhoods.northCoast")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("footer.investment.title")}>
            <FooterLink to="/investment">{t("footer.investment.legalVerification")}</FooterLink>
            <FooterLink to="/investment">{t("footer.investment.rentalIncome")}</FooterLink>
            <FooterLink to="/investment">{t("footer.investment.garagesLand")}</FooterLink>
            <FooterLink to="/investment">{t("footer.investment.palmGroves")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("footer.support.title")}>
            <FooterLink to="/support">{t("footer.support.helpCenter")}</FooterLink>
            <FooterLink to="/support">{t("footer.support.howItWorks")}</FooterLink>
            <FooterLink to="/support">{t("footer.support.faq")}</FooterLink>
            <FooterLink to="/contact">{t("footer.support.contactUs")}</FooterLink>
          </FooterCol>
        </div>

        {/* Onboarding steps */}
        <section className="rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 p-6">
          <h3 className="font-semibold text-lg mb-5">{t("footer.steps.title")}</h3>
          <ol className="grid gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.key} className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 shadow-soft">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-primary-foreground/60">{t("footer.steps.step", { number: i + 1 })}</div>
                  <div className="font-medium">{t(`footer.steps.${s.key}`)}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Contact CTA */}
        <section className="grid gap-6 md:grid-cols-2 items-center">
          <div className="rounded-2xl bg-accent/10 border border-accent/30 p-6">
            <h3 className="font-semibold text-lg">{t("footer.cta.title")}</h3>
            <p className="text-sm text-primary-foreground/75 mt-1">
              {t("footer.cta.desc")}
            </p>
            <Link
              to="/consultation"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition"
            >
              {t("footer.cta.bookNow")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-4">
              <BadgeCheck className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
              <p className="text-sm text-primary-foreground/80">{t("footer.cta.verified")}</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-4">
              <Shield className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
              <p className="text-sm text-primary-foreground/80">{t("footer.cta.bestDeals")}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom bar */}
      <div className="bg-black/30 border-t border-primary-foreground/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-primary-foreground/70">
          <p>{t("footer.bottom.copyright")}</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-secondary transition-colors">{t("footer.bottom.privacy")}</Link>
            <Link to="/terms" className="hover:text-secondary transition-colors">{t("footer.bottom.terms")}</Link>
            <Link to="/cookies" className="hover:text-secondary transition-colors">{t("footer.bottom.cookies")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold mb-4">{title}</h3>
      <ul className="space-y-2 text-sm text-primary-foreground/70">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="hover:text-secondary transition-colors">{children}</Link>
    </li>
  );
}
