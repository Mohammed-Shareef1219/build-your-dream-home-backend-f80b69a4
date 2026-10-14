/**
 * Subscription package helpers shared across the app.
 * Server-side math (activation/expiration) lives in Supabase SQL functions;
 * these utilities mirror the display logic only.
 */

export const PLAN_DURATIONS = ["7_days", "3_months", "6_months"] as const;
export type PlanDuration = (typeof PLAN_DURATIONS)[number];

export const SUBSCRIPTION_STATUSES = [
  "pending_approval",
  "active",
  "expired",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export type SubscriptionFields = {
  subscription_status: string | null;
  plan_duration: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
};

export function isPlanDuration(value: string | null | undefined): value is PlanDuration {
  return !!value && (PLAN_DURATIONS as readonly string[]).includes(value);
}

/** True when the subscription is active AND the end date is still in the future. */
export function isSubscriptionActive(sub: SubscriptionFields | null | undefined): boolean {
  return (
    !!sub &&
    sub.subscription_status === "active" &&
    !!sub.subscription_end &&
    new Date(sub.subscription_end) > new Date()
  );
}

/**
 * Status as it should be treated right now — protects against cron lag by
 * reporting 'expired' once subscription_end has passed, even if the daily
 * job hasn't flipped the row yet.
 */
export function effectiveSubscriptionStatus(
  sub: SubscriptionFields | null | undefined,
): SubscriptionStatus | null {
  if (!sub?.subscription_status) return null;
  if (sub.subscription_status === "active" && !isSubscriptionActive(sub)) return "expired";
  return sub.subscription_status as SubscriptionStatus;
}

/** Client-side mirror of activate_subscription's end-date calculation. */
export function addPlanDuration(start: Date, duration: PlanDuration): Date {
  const end = new Date(start);
  if (duration === "7_days") end.setDate(end.getDate() + 7);
  if (duration === "3_months") end.setMonth(end.getMonth() + 3);
  if (duration === "6_months") end.setMonth(end.getMonth() + 6);
  return end;
}
