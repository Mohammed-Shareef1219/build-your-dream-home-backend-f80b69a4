# 🏠 Property Request Feature — Setup Guide

Everything for the new **Property Request** feature lives in this folder. Follow the
steps in order. **Total cost: $0** — everything below runs on the Supabase **free plan**.

---

## 📦 What lives where

| # | File | What it is |
|---|------|------------|
| 1 | `supabase/migrations/20260930000000_property_requests.sql` | Table + RLS (run in SQL Editor) |
| 2 | `supabase/functions/property-request-notify/index.ts` | Edge Function that emails you via Resend |
| 3 | `supabase/migrations/20260930000001_property_request_email_trigger.sql` | DB trigger that calls the function (run **after** deploying #2) |
| 4 | `src/components/PropertyRequestForm.tsx` | Form component (dropdown with the exact Arabic types) |
| 5 | `src/routes/request-property.tsx` | New page at **/request-property** |
| 6 | `src/i18n/locales/{en,ar}/propertyRequest.json` | Translations (auto-registered namespace) |
| 7 | `src/routes/admin.tsx` | **Requests** tab in the dashboard (already wired) |
| 8 | `src/i18n/locales/{en,ar}/account.json` | Admin tab labels (already updated) |

---

## Step 1 — Create the table (Supabase Dashboard → SQL Editor)

1. Open https://supabase.com/dashboard → your project → **SQL Editor** → **New query**.
2. Paste the **entire contents** of `supabase/migrations/20260930000000_property_requests.sql`.
3. Click **Run**.

What this creates:
- `property_requests` table: `id` (auto UUID), `created_at`, `client_name`,
  `client_phone`, `client_email`, `property_code`, `property_type`.
- `property_type` accepts **only** these exact values (CHECK constraint):
  `شقق`, `فيلا`, `دوبليكس`, `استوديوهات`, `بيوت ذكية`, `بيوت ريفية`, `أراضي مونت سيتي`, `أراضي مونت عجيبة`
- RLS: **any visitor can INSERT only** — nobody can read others' submissions.
  Admins (rows in `user_roles` with `role='admin'`) can SELECT and DELETE.
  There is intentionally **no UPDATE** policy, so requests are immutable to clients.

**Verify:** Dashboard → Table Editor → `property_requests` appears with 0 rows.
Dashboard → Authentication → Policies → `property_requests` shows the 3 policies.

---

## Step 2 — Deploy the Edge Function (from your computer's terminal)

```bash
cd build-your-dream-home-backend-f80b69a4-main

# one-time login (opens browser)
npx supabase login

# link your project (find the ref in Dashboard → Settings → General)
npx supabase link --project-ref <PROJECT_REF>

# deploy the email function (no JWT check = the DB trigger can call it)
npx supabase functions deploy property-request-notify --no-verify-jwt

# set the secrets (once)
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxx NOTIFY_EMAIL=buildyourhom@gmail.com
```

- `RESEND_API_KEY` — create a free account at https://resend.com → API Keys →
  create key (free tier: **100 emails/day**, plenty here).
- `NOTIFY_EMAIL` — the personal inbox that receives every request.
- Optional: `npx supabase secrets set NOTIFY_FROM_EMAIL="BuildYourHome <you@yourdomain.com>"`
  only if you verify your own domain in Resend. Otherwise leave it — the function
  defaults to `BuildYourHome <onboarding@resend.dev>`, which works on the free plan
  but can **only deliver to your own email address** (the account that owns the
  Resend key) — which is exactly what we need here.

---

## Step 3 — Add the DB trigger (SQL Editor, run AFTER Step 2)

1. SQL Editor → New query.
2. Open `supabase/migrations/20260930000001_property_request_email_trigger.sql`
   and **replace the two placeholders** before running:
   - `<PROJECT_REF>` → your project ref (the `xxxx` in `https://xxxx.supabase.co`)
   - `<SERVICE_ROLE_KEY>` → Dashboard → Project Settings → API → `service_role` secret
3. Paste and **Run**.

What this creates:
- Enables `pg_net` (Supabase's built-in HTTP client for triggers).
- `handle_new_property_request()` — a `security definer` function that
  fire-and-forget POSTs `{type:'INSERT', record:<new row>}` to your deployed
  Edge Function the instant a row is inserted.
- `on_property_request_created` trigger on `property_requests`.

---

## Step 4 — Frontend (already wired into this codebase)

Nothing to run — the pieces are already in place and typed:

- **Form:** `src/components/PropertyRequestForm.tsx` — validates all fields,
  inserts into `property_requests` with the Supabase JS client, shows a
  success screen + toast. The dropdown lists the 8 Arabic types in exactly the
  same order as the CHECK constraint.
- **Page:** `src/routes/request-property.tsx` → live at `/request-property`
  (EN/AR via i18n, RTL-correct inputs).
- **Contact page:** now shows a "Request a property" card linking to the form.
- **Admin dashboard:** `/admin` gained a fourth tab **Requests** with a live
  count, type badge + property code chip, and delete (admins only, per RLS).
- **Types:** `property_requests` Row/Insert/Update added to
  `src/integrations/supabase/types.ts`.

If the Supabase URL/key env vars aren't set yet, add them to `.env`:

```env
VITE_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon public key>
```

---

## Step 5 — Test end-to-end

1. `npm run dev` → open `/request-property` (or `/ar/request-property`).
2. Fill the form with a real-looking request → **Send request**.
3. Expect: green success screen + toast; row appears in Supabase Table Editor.
4. Within a few seconds, the notify email arrives at `NOTIFY_EMAIL`
   (check spam; Resend Dashboard → Logs shows every send).
5. Sign in as your admin account → `/admin` → **Requests** tab shows the row;
   the delete button removes it.
6. Negative test: while logged out, the anon key **cannot** SELECT rows
   (RLS denies it) — only INSERT works.

### Troubleshooting

| Symptom | Fix |
|---|---|
| Form inserts fail with `42501` (RLS) | Re-run Step 1; check the INSERT policy exists and `to anon, authenticated`. |
| Row saved but no email | Supabase Dashboard → Edge Functions → Logs → `property-request-notify`; then Resend → Logs. Verify secrets were set (Step 2) and trigger SQL was run with real placeholders (Step 3). |
| Trigger SQL errors on `pg_net` | Run `create extension if not exists pg_net;` alone first, then the rest. |
| Email not received | Resend free `onboarding@resend.dev` sender only delivers to your own Resend account's email — make sure `NOTIFY_EMAIL` matches that address, or verify a domain. |
| "Invalid input syntax / check constraint" on insert | The `property_type` value must match the Arabic strings byte-for-byte; use the dropdown, don't type it manually. |

---

# 🗺️ Plot Reservations (Interactive Land Maps) — Setup Guide

The "Reserve Plot" button on the Mount City & Mount Agiba Resort interactive
maps (`/catalog/land/IB-2026-A1` and `/catalog/land/IB-2026-A2`) opens a lead
capture modal (Name / Email / Phone) and stores the lead in Supabase.

## Step 1 — Create the table (Supabase Dashboard → SQL Editor)

1. Open https://supabase.com/dashboard → your project → **SQL Editor** → **New query**.
2. Paste the **entire contents** of `supabase/migrations/20261002000000_plot_reservations.sql`.
3. Click **Run**.

What this creates:
- `plot_reservations` table: `id` (auto UUID), `created_at` (auto timestamp),
  `full_name`, `email`, `phone`, `project_source` (e.g. `Mount City`,
  `Mount Agiba Resort`), `plot_number` (e.g. `P-01`).
- RLS: **any visitor can INSERT only** — nobody can read others' leads.
  Admins (rows in `user_roles` with `role='admin'`) can SELECT and DELETE.
  There is intentionally **no UPDATE** policy, so leads are immutable to clients.

**Verify:** Dashboard → Table Editor → `plot_reservations` appears with 0 rows.

## Step 2 — Test the flow

1. `npm run dev` → open `/catalog/land/IB-2026-A1`.
2. Click any plot → the info card is pinned to the top-right of the map.
3. Click **Reserve Plot / احجز القطعة** → the modal opens.
4. Fill name / email / phone → **Submit reservation**.
5. Expect: success toast, modal closes, and a new row in
   Dashboard → Table Editor → `plot_reservations` with the correct
   `project_source` (page the button lives on) and `plot_number`.
6. While logged out, the anon key **cannot** SELECT rows (RLS denies it).

> Optional: to mirror leads into an admin tab or trigger a notify email like
> `property_requests` does, reuse the `property-request-notify` function
> pattern — the table is ready for it.

---

# 🛰️ Live Plot Statuses (Realtime Map) — Setup Guide

The interactive maps read each plot's status from the `plots` table and
subscribe to Supabase Realtime: when an admin changes a plot's status
(Table Editor / dashboard), every open client map updates its border color
**instantly, without a reload**.

Status → color guide used by the map:

| Status | Meaning | Border | Fill (very light) |
|---|---|---|---|
| `available` | 🟢 Ready for purchase | Cyan `#2dd4bf` | teal @ 10% |
| `reserved` | 🟡 Held for a client | Orange `#f59e0b` | amber @ 13% |
| `sold` | ⚫ Sold | Dark gray `#374151` | gray @ 16% |
| `security` | 🟣 Security / private | Purple `#8b5cf6` | violet @ 11% |

## Step 1 — Create the table + realtime (Supabase Dashboard → SQL Editor)

1. Open https://supabase.com/dashboard → your project → **SQL Editor** → **New query**.
2. Paste the **entire contents** of `supabase/migrations/20261002010000_plots.sql`.
3. Click **Run**.

What this creates:
- `plots` table: `id`, `created_at`, `project_code` (`IB-2026-A1` /
  `IB-2026-A2`), `plot_number` (`P-01`…), `status`
  (`available | reserved | sold | security`), unique per (project, plot).
- RLS: **everyone can read**; only admins can insert/update/delete.
- Adds the table to the `supabase_realtime` publication (required for live
  updates) and seeds **all 58 plots as `available`**.

**Verify:** Table Editor → `plots` shows 58 rows.

## Step 2 — Change a status and watch it go live

1. Open `/catalog/land/IB-2026-A1` in one tab.
2. In Supabase Table Editor → `plots`, edit `P-01` (project `IB-2026-A1`)
   → set `status` to `reserved`.
3. Within a second the plot's border on the open map turns orange — no reload.

## Set a plot back / in bulk (optional)

```sql
update public.plots set status = 'sold'
  where project_code = 'IB-2026-A1' and plot_number in ('P-03', 'P-09');
```

> Until this SQL is run, the maps fall back to the built-in static status
> pattern — the page never breaks, it just isn't DB-driven or live yet.
