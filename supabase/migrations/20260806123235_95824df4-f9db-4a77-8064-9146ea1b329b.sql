CREATE TABLE public.sync_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  users_synced integer NOT NULL DEFAULT 0,
  consultations_synced integer NOT NULL DEFAULT 0,
  inquiries_synced integer NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sync_runs TO authenticated;
GRANT ALL ON public.sync_runs TO service_role;

ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view sync runs"
ON public.sync_runs FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));