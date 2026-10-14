# Subscription Packages — Setup Guide

The complete subscription feature is already implemented in code. **One manual step remains: apply the SQL migration to your live Supabase database.**

## Status: migration NOT yet applied
Checking `profiles.subscription_status` against your live database returned:
> `column profiles.subscription_status does not exist`

## How to apply (5 minutes)

1. Open https://supabase.com/dashboard → your project
2. **SQL Editor** → **New query**
3. Paste the full contents of `supabase/migrations/20261007090000_subscription_packages.sql` → **Run**
4. Paste the full contents of `supabase/migrations/20261010100000_owner_property_images.sql` → **Run**
   (this second one lets users upload their own listing photos)

If `pg_cron` is not enabled, the migration prints a notice — enable it under
Database → Extensions, then re-run the last block (or call
`SELECT public.expire_subscriptions();` daily manually).

## What each piece does (already coded)

| Spec requirement | Where it lives |
|---|---|
| `subscription_status`, `plan_duration`, `subscription_start`, `subscription_end` on profiles | migration §1 |
| Users can't forge their own status (guard trigger) | migration §2 |
| "Start" → `pending_approval` + plan saved | `request_subscription()` RPC + `src/components/PricingPackages.tsx` on the home page (anchor `#packages`) |
| Admin "Approve/Activate" button | `src/routes/admin.tsx` → Subscriptions tab; calls atomic `activate_subscription()` which sets status, start=now() and end=now()+7d/3m/6m |
| Daily expiration cron | migration §5 — `expire_subscriptions()` batch-updates active→expired, scheduled at 03:00 UTC via `pg_cron`; listings untouched |
| Expired users: block new/edit listings | RLS policies require `has_active_subscription()` on INSERT/UPDATE |
| Expired users: redirect to renewal | `src/routes/dashboard.tsx` intercepts expired logins and routes to `#packages` |
| Public listings independent of subscription | "Anyone can view properties" RLS stays true-for-all; listings never deleted/hidden |

## Test flow after applying

1. Sign in as a normal user → home page → Packages → pick a plan → **Start** → badge shows *Awaiting approval*
2. Sign in as admin → Admin Dashboard → **Subscriptions** tab → **Approve/Activate** → status turns *Active* with new end date
3. Expired test: set an end date in the past → dashboard pushes you to the renewal page; listings stay visible on the public site
