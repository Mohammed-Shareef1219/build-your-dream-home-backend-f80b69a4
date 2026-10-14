-- ════════════════════════════════════════════════════════════════════
-- Property Request feature — table + RLS
-- WHERE: Supabase Dashboard → SQL Editor → New query → paste ALL → Run
-- ════════════════════════════════════════════════════════════════════

-- 1) Table -----------------------------------------------------------
create table if not exists public.property_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  client_name   text        not null,
  client_phone  text        not null,
  client_email  text        not null,
  property_code text        not null,
  property_type text        not null
    check (property_type in (
      'شقق',
      'فيلا',
      'دوبليكس',
      'استوديوهات',
      'بيوت ذكية',
      'بيوت ريفية',
      'أراضي مونت سيتي',
      'أراضي مونت عجيبة'
    ))
);

-- Helpful index for admin browsing by type / newest-first
create index if not exists property_requests_created_at_idx
  on public.property_requests (created_at desc);
create index if not exists property_requests_type_idx
  on public.property_requests (property_type);

-- 2) Row Level Security ----------------------------------------------
alter table public.property_requests enable row level security;

-- Anyone (even not signed in) may INSERT a request — nothing else.
drop policy if exists "Visitors can submit property requests" on public.property_requests;
create policy "Visitors can submit property requests"
  on public.property_requests
  for insert
  to anon, authenticated
  with check (true);

-- Only admins (user_roles.role = 'admin') may read submitted requests.
-- The subquery on user_roles is evaluated with the caller's permissions,
-- so an anonymous visitor can never read the table through it.
drop policy if exists "Admins can read property requests" on public.property_requests;
create policy "Admins can read property requests"
  on public.property_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

-- Admins may delete spam requests.
drop policy if exists "Admins can delete property requests" on public.property_requests;
create policy "Admins can delete property requests"
  on public.property_requests
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

-- No UPDATE policy on purpose: submitted requests are immutable to clients.
-- (The service_role key used by the Edge Function bypasses RLS entirely.)
