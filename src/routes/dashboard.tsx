import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Mail, Phone, User as UserIcon, Calendar, Shield, BadgeCheck, Clock, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { effectiveSubscriptionStatus, isPlanDuration, type SubscriptionFields } from "@/lib/subscription";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — BuildYourHome" },
      { name: "description", content: "Your BuildYourHome account overview and profile." },
      { property: "og:title", content: "Dashboard — BuildYourHome" },
      { property: "og:description", content: "Your BuildYourHome account overview and profile." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

type ProfileRow = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  account_type: string | null;
  profile_image: string | null;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  created_at: string;
  subscription_status: string | null;
  plan_duration: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
};

function DashboardPage() {
  const { t } = useTranslation("account");
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setProfile(data as ProfileRow | null);
        setLoading(false);
      });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("dashboard.signedOutToast"));
  };

  const subscription: SubscriptionFields | null = profile
    ? {
        subscription_status: profile.subscription_status,
        plan_duration: profile.plan_duration,
        subscription_start: profile.subscription_start,
        subscription_end: profile.subscription_end,
      }
    : null;
  const subStatus = effectiveSubscriptionStatus(subscription);
  const subBadgeClass =
    subStatus === "active"
      ? "bg-emerald-500/15 text-emerald-600"
      : subStatus === "pending_approval"
        ? "bg-amber-500/15 text-amber-600"
        : subStatus === "expired"
          ? "bg-destructive/15 text-destructive"
          : "bg-muted text-muted-foreground";

  // Expired brokers/owners are sent to the packages (renewal) page on login.
  // Their listings stay public — this only gates their dashboard capabilities.
  useEffect(() => {
    if (loading || isAdmin || subStatus !== "expired") return;
    toast.error(t("dashboard.subscription.redirecting"), { duration: 4000 });
    const timer = setTimeout(() => navigate({ to: "/", hash: "packages" }), 3500);
    return () => clearTimeout(timer);
  }, [loading, isAdmin, subStatus, navigate, t]);

  const name = profile?.full_name || profile?.display_name || user?.email?.split("@")[0] || t("dashboard.guest");
  const image = profile?.profile_image || profile?.avatar_url;
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-primary/20 border-4 border-background flex items-center justify-center overflow-hidden text-2xl font-bold text-primary">
            {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-muted-foreground">{profile?.email || user?.email}</p>
            {profile?.account_type && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Shield className="h-3 w-3" /> {profile.account_type}
              </span>
            )}
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" /> {t("dashboard.signOut")}
          </Button>
        </div>

        <div className="grid gap-4 p-8 sm:grid-cols-2">
          <InfoRow icon={<UserIcon className="h-4 w-4" />} label={t("dashboard.fullName")} value={profile?.full_name || t("dashboard.notAvailable")} loading={loading} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label={t("dashboard.email")} value={profile?.email || user?.email || t("dashboard.notAvailable")} loading={loading} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label={t("dashboard.phone")} value={profile?.phone || t("dashboard.notAvailable")} loading={loading} />
          <InfoRow icon={<Shield className="h-4 w-4" />} label={t("dashboard.accountType")} value={profile?.account_type || t("dashboard.customer")} loading={loading} />
          <InfoRow icon={<Calendar className="h-4 w-4" />} label={t("dashboard.joined")} value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : t("dashboard.notAvailable")} loading={loading} />
          <InfoRow icon={<UserIcon className="h-4 w-4" />} label={t("dashboard.location")} value={[profile?.city, profile?.country].filter(Boolean).join(", ") || t("dashboard.notAvailable")} loading={loading} />
        </div>

        {subscription?.subscription_status && (
          <div className="border-t border-border px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BadgeCheck className="h-4 w-4 text-secondary" /> {t("dashboard.subscription.heading")}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${subBadgeClass}`}>
                    {t(`dashboard.subscription.statuses.${subStatus ?? "none"}`)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {isPlanDuration(subscription.plan_duration) && (
                    <>{t(`dashboard.subscription.plans.${subscription.plan_duration}`)} · </>
                  )}
                  {subscription.subscription_start && (
                    <>{t("dashboard.subscription.starts")}: {new Date(subscription.subscription_start).toLocaleDateString()} · </>
                  )}
                  {subscription.subscription_end && (
                    <>{t("dashboard.subscription.ends")}: {new Date(subscription.subscription_end).toLocaleDateString()}</>
                  )}
                  {!subscription.plan_duration && !subscription.subscription_end && t("dashboard.subscription.statuses.none")}
                </div>
                {subStatus === "expired" && (
                  <p className="mt-2 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {t("dashboard.subscription.expiredBanner")}
                  </p>
                )}
                {subStatus === "pending_approval" && (
                  <p className="mt-2 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0" /> {t("dashboard.subscription.pendingBanner")}
                  </p>
                )}
              </div>
              {subStatus !== "active" && (
                <Button asChild variant="brand" className="w-fit gap-2">
                  <Link to="/" hash="packages">{t("dashboard.subscription.renewCta")}</Link>
                </Button>
              )}
            </div>
          </div>
        )}

        {profile?.bio && (
          <div className="px-8 pb-8">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">{t("dashboard.bio")}</h2>
            <p className="text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, loading }: { icon: React.ReactNode; label: string; value: string; loading: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-medium">{loading ? "…" : value}</div>
    </div>
  );
}
