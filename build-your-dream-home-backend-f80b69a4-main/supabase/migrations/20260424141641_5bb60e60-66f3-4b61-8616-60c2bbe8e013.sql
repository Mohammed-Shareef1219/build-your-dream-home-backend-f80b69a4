
-- Fix search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Tighten anonymous insert policies (require non-empty validated fields)
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 100
    AND length(trim(email)) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(trim(message)) BETWEEN 1 AND 2000
    AND (phone IS NULL OR length(phone) <= 30)
  );

DROP POLICY IF EXISTS "Anyone can submit consultations" ON public.consultations;
CREATE POLICY "Anyone can submit consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 100
    AND length(trim(email)) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(trim(message)) BETWEEN 1 AND 2000
    AND (phone IS NULL OR length(phone) <= 30)
    AND (project_type IS NULL OR length(project_type) <= 100)
    AND (budget IS NULL OR length(budget) <= 100)
  );
