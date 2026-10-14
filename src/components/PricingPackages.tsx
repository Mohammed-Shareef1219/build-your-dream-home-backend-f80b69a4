import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PLAN_DURATIONS, type PlanDuration } from "@/lib/subscription";

const PLANS: { duration: PlanDuration; highlight: boolean }[] = [
  { duration: "7_days", highlight: false },
  { duration: "3_months", highlight: true },
  { duration: "6_months", highlight: false },
];

export function PricingPackages() {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<PlanDuration | null>(null);

  useEffect(() => {
    if (!user) {
      setStatus(null);
      setPlan(null);
      return;
    }
    supabase
      .from("profiles")
      .select("subscription_status, plan_duration")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const row = (data ?? null) as
          | { subscription_status: string | null; plan_duration: string | null }
          | null;
        setStatus(row?.subscription_status ?? null);
        setPlan(row?.plan_duration ?? null);
      });
  }, [user]);

  const start = async (duration: PlanDuration) => {
    if (!user) {
      navigate({ to: "/auth", search: { mode: "login" } });
      return;
    }
    setSubmitting(duration);
    const { error } = await supabase.rpc("request_subscription", { duration });
    setSubmitting(null);
    if (error) return toast.error(t("packages.toasts.requestError"));
    setStatus("pending_approval");
    setPlan(duration);
    toast.success(t("packages.toasts.requestSent"));
  };

  return (
    <section id="packages" className="bg-muted/30 border-y py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 text-secondary font-semibold text-sm uppercase tracking-wider">
            <Sparkles className="h-4 w-4" /> {t("packages.eyebrow")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-3">{t("packages.heading")}</h2>
          <p className="text-muted-foreground text-lg">{t("packages.subheading")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {PLANS.map((p) => {
            const features = t(`packages.${p.duration}.features`, { returnObjects: true }) as string[];
            const isCurrentPlan = plan === p.duration;
            const isPending = status === "pending_approval" && isCurrentPlan;
            const isActive = status === "active" && isCurrentPlan;
            const otherActive = status === "active" && !isCurrentPlan;
            const busy = submitting === p.duration;

            let label = user ? t("packages.states.start") : t("packages.states.signIn");
            if (status === "expired" && isCurrentPlan) label = t("packages.states.renew");
            if (isPending) label = t("packages.states.pending");
            if (isActive) label = t("packages.states.active");

            const disabled = busy || isPending || isActive || otherActive;

            const button = (
              <Button
                asChild={!user}
                variant={p.highlight ? "accent" : "brand"}
                className="mt-8"
                disabled={!!user && disabled}
                onClick={user ? () => void start(p.duration) : undefined}
              >
                {user ? (
                  <span className="inline-flex items-center gap-2">
                    {busy ? <Clock className="h-4 w-4 animate-spin" /> : null}
                    {busy ? t("packages.states.processing") : label}
                  </span>
                ) : (
                  <Link to="/auth" search={{ mode: "login" }}>
                    {label} <ArrowRight />
                  </Link>
                )}
              </Button>
            );

            return (
              <div
                key={p.duration}
                className={`relative rounded-3xl p-8 flex flex-col shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant ${
                  p.highlight ? "bg-secondary text-secondary-foreground" : "bg-card"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 start-8 bg-accent text-accent-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-soft">
                    {t("packages.popular")}
                  </span>
                )}
                <h3 className="text-xl font-bold">{t(`packages.${p.duration}.name`)}</h3>
                <p className={`mt-1 text-sm ${p.highlight ? "text-secondary-foreground/80" : "text-muted-foreground"}`}>
                  {t(`packages.${p.duration}.tagline`)}
                </p>
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-4xl font-extrabold">{t(`packages.${p.duration}.price`)}</span>
                  <span className={`pb-1.5 text-sm ${p.highlight ? "text-secondary-foreground/80" : "text-muted-foreground"}`}>
                    {t(`packages.${p.duration}.period`)}
                  </span>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`size-4 shrink-0 mt-0.5 ${p.highlight ? "text-accent" : "text-secondary"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {button}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
