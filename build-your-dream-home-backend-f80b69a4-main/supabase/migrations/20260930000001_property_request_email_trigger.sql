-- ════════════════════════════════════════════════════════════════════
-- Auto-notify Edge Function when a new property_requests row lands.
-- Uses pg_net (built into Supabase) — no Database Webhooks UI needed.
-- WHERE: Supabase Dashboard → SQL Editor → paste ALL → Run
-- (Run this AFTER deploying the Edge Function, or replace <PROJECT_REF>
--  and <ANON_KEY> manually if you use the Dashboard webhook instead.)
-- ════════════════════════════════════════════════════════════════════

-- 1) Enable pg_net (usually already on; harmless if repeated)
create extension if not exists pg_net;

-- 2) Fire-and-forget HTTP POST whenever a row is inserted
create or replace function public.handle_new_property_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/property-request-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'record', to_jsonb(NEW)
    ),
    timeout_milliseconds := 8000
  );
  return NEW;
end;
$$;

drop trigger if exists on_property_request_created on public.property_requests;
create trigger on_property_request_created
  after insert on public.property_requests
  for each row
  execute function public.handle_new_property_request();
