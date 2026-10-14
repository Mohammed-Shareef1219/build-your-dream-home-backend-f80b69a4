-- ════════════════════════════════════════════════════════════════════
-- Live plot statuses for the interactive land maps
-- (Mount City IB-2026-A1, Mount Agiba Resort IB-2026-A2)
-- WHERE: Supabase Dashboard → SQL Editor → New query → paste ALL → Run
--
-- The map component subscribes to changes on this table, so when an
-- admin updates a plot's status the color on the client map changes
-- instantly — no page reload.
-- ════════════════════════════════════════════════════════════════════

-- 1) Table -----------------------------------------------------------
create table if not exists public.plots (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  project_code text not null,
  plot_number  text not null,
  status       text not null default 'available'
    check (status in ('available', 'reserved', 'sold', 'security')),
  unique (project_code, plot_number)
);

create index if not exists plots_project_idx on public.plots (project_code);

-- 2) Row Level Security ----------------------------------------------
alter table public.plots enable row level security;

-- Everyone may READ plot statuses (the map must render for visitors).
drop policy if exists "Anyone can read plot statuses" on public.plots;
create policy "Anyone can read plot statuses"
  on public.plots
  for select
  to anon, authenticated
  using (true);

-- Only admins (user_roles.role = 'admin') may change statuses.
drop policy if exists "Admins can update plot statuses" on public.plots;
create policy "Admins can update plot statuses"
  on public.plots
  for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

drop policy if exists "Admins can insert plots" on public.plots;
create policy "Admins can insert plots"
  on public.plots
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

drop policy if exists "Admins can delete plots" on public.plots;
create policy "Admins can delete plots"
  on public.plots
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

-- 3) Realtime ----------------------------------------------------------
-- REQUIRED so postgres_changes subscriptions deliver UPDATE events.
alter table public.plots replica identity full;
drop publication if exists supabase_realtime;
create publication supabase_realtime for table public.plots;
-- If the publication already existed with other tables, use instead:
--   alter publication supabase_realtime add table public.plots;

-- 4) Seed — every plot starts as "available" --------------------------
-- Mount City: P-01 … P-42  (IB-2026-A1)
insert into public.plots (project_code, plot_number, status)
select 'IB-2026-A1', 'P-' || lpad(g::text, 2, '0'), 'available'
from generate_series(1, 42) as g
on conflict (project_code, plot_number) do nothing;

-- Mount Agiba Resort: P-01 … P-16  (IB-2026-A2)
insert into public.plots (project_code, plot_number, status)
select 'IB-2026-A2', 'P-' || lpad(g::text, 2, '0'), 'available'
from generate_series(1, 16) as g
on conflict (project_code, plot_number) do nothing;
