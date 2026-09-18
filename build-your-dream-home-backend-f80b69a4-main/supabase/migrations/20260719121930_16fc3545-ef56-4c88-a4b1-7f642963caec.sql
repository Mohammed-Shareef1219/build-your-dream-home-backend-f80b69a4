
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS service TEXT,
  ADD COLUMN IF NOT EXISTS timeline TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Tighten insert: must be signed in and own the row
DROP POLICY IF EXISTS "Anyone can submit consultations" ON public.consultations;

CREATE POLICY "Authenticated users submit their own consultations"
  ON public.consultations FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND length(trim(name)) BETWEEN 1 AND 100
    AND length(trim(email)) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(trim(message)) BETWEEN 1 AND 4000
    AND (phone IS NULL OR length(phone) <= 30)
    AND (company IS NULL OR length(company) <= 150)
    AND (service IS NULL OR length(service) <= 150)
    AND (timeline IS NULL OR length(timeline) <= 100)
    AND (description IS NULL OR length(description) <= 4000)
    AND (notes IS NULL OR length(notes) <= 2000)
    AND (project_type IS NULL OR length(project_type) <= 100)
    AND (budget IS NULL OR length(budget) <= 100)
  );

-- Users can read their own submissions
CREATE POLICY "Users view their own consultations"
  ON public.consultations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
