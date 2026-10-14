-- ════════════════════════════════════════════════════════════════════
-- Plot Reservation leads — table + RLS
-- WHERE: Supabase Dashboard → SQL Editor → New query → paste ALL → Run
-- Captures "Reserve Plot" leads from the interactive land maps
-- (Mount City IB-2026-A1 / Mount Agiba Resort IB-2026-A2).
-- ════════════════════════════════════════════════════════════════════

-- 1) Table -----------------------------------------------------------
create table if not exists public.plot_reservations (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  full_name      text        not null,
  email          text        not null,
  phone          text        not null,
  project_source text        not null,
  plot_number    text        not null
);

-- Helpful indexes for admin browsing (newest first, per project)
create index if not exists plot_reservations_created_at_idx
  on public.plot_reservations (created_at desc);
create index if not exists plot_reservations_project_idx
  on public.plot_reservations (project_source);

-- 2) Row Level Security ----------------------------------------------
alter table public.plot_reservations enable row level security;

-- Anyone (even not signed in) may INSERT a reservation lead — nothing else.
drop policy if exists "Visitors can submit plot reservations" on public.plot_reservations;
create policy "Visitors can submit plot reservations"
  on public.plot_reservations
  for insert
  to anon, authenticated
  with check (true);

-- Only admins (user_roles.role = 'admin') may read submitted leads.
drop policy if exists "Admins can read plot reservations" on public.plot_reservations;
create policy "Admins can read plot reservations"
  on public.plot_reservations
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

-- Admins may delete spam leads.
drop policy if exists "Admins can delete plot reservations" on public.plot_reservations;
create policy "Admins can delete plot reservations"
  on public.plot_reservations
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

-- No UPDATE policy on purpose: submitted leads are immutable to clients.
