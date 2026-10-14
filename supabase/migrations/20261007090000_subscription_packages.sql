-- ============================================================================
-- Subscription packages for brokers & property owners
--
-- profiles gains:
--   subscription_status  text  NULL | 'pending_approval' | 'active' | 'expired'
--                        (NULL = never subscribed — regular customers unaffected)
--   plan_duration        text  NULL | '7_days' | '3_months' | '6_months'
--   subscription_start   timestamptz  set by admin approval
--   subscription_end     timestamptz  calculated from plan_duration
--
-- properties gains owner_id so brokers/property owners can publish listings;
-- write access requires an ACTIVE subscription, while public visibility of
-- listings never depends on the owner's subscription (data retention).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Subscription fields on profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS plan_duration text,
  ADD COLUMN IF NOT EXISTS subscription_start timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_end timestamptz;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_status_check
  CHECK (subscription_status IS NULL OR subscription_status IN ('pending_approval', 'active', 'expired'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_duration_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_duration_check
  CHECK (plan_duration IS NULL OR plan_duration IN ('7_days', '3_months', '6_months'));

CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx
  ON public.profiles(subscription_status);

-- ---------------------------------------------------------------------------
-- 2) Guard trigger: users may never forge their own subscription state.
--    Only allowed self-service transition is (re)requesting a plan
--    -> 'pending_approval' with a valid plan_duration and empty dates.
--    Admins and server-side jobs (no JWT / service_role) pass freely.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_subscription_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR private.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.subscription_start IS DISTINCT FROM OLD.subscription_start
     OR NEW.subscription_end IS DISTINCT FROM OLD.subscription_end THEN
    IF NOT (
      NEW.subscription_status = 'pending_approval'
      AND NEW.plan_duration IN ('7_days', '3_months', '6_months')
      AND NEW.subscription_start IS NULL
      AND NEW.subscription_end IS NULL
    ) THEN
      RAISE EXCEPTION
        'Subscription state can only be changed by requesting a plan (pending_approval) or by an admin.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_subscription_fields ON public.profiles;
CREATE TRIGGER guard_subscription_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_subscription_fields();

REVOKE EXECUTE ON FUNCTION public.guard_subscription_fields() FROM anon, authenticated, PUBLIC;

-- ---------------------------------------------------------------------------
-- 3) User request: "Start" on a package -> pending_approval + plan_duration
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.request_subscription(duration text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to request a subscription.';
  END IF;
  IF duration NOT IN ('7_days', '3_months', '6_months') THEN
    RAISE EXCEPTION 'Invalid plan duration.';
  END IF;

  UPDATE public.profiles
  SET subscription_status = 'pending_approval',
      plan_duration = duration,
      subscription_start = NULL,
      subscription_end = NULL,
      updated_at = now()
  WHERE id = auth.uid();
END;
$$;
REVOKE EXECUTE ON FUNCTION public.request_subscription(text) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_subscription(text) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 4) Admin approval: atomic activation.
--    Sets status='active', subscription_start=now(),
--    subscription_end=now() + (7 days | 3 months | 6 months).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.activate_subscription(target_user_id uuid, duration text)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_end timestamptz;
BEGIN
  IF auth.uid() IS NULL OR NOT private.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can activate subscriptions.';
  END IF;
  IF duration NOT IN ('7_days', '3_months', '6_months') THEN
    RAISE EXCEPTION 'Invalid plan duration.';
  END IF;

  new_end := CASE duration
    WHEN '7_days'   THEN now() + interval '7 days'
    WHEN '3_months' THEN now() + interval '3 months'
    WHEN '6_months' THEN now() + interval '6 months'
  END;

  UPDATE public.profiles
  SET subscription_status = 'active',
      plan_duration = duration,
      subscription_start = now(),
      subscription_end = new_end,
      updated_at = now()
  WHERE id = target_user_id;

  RETURN new_end;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.activate_subscription(uuid, text) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_subscription(uuid, text) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 5) Expiration + daily cron (pg_cron).
--    Batch-expires every active subscription whose end date has passed.
--    Listings are NOT touched — only the profile status flips to 'expired'.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count integer := 0;
BEGIN
  UPDATE public.profiles
  SET subscription_status = 'expired',
      updated_at = now()
  WHERE subscription_status = 'active'
    AND subscription_end IS NOT NULL
    AND subscription_end < now();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.expire_subscriptions() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_subscriptions() TO service_role;

DO $$
BEGIN
  IF to_regclass('extensions.cron.job') IS NULL THEN
    RAISE NOTICE 'pg_cron not available — expiration job NOT scheduled. Call public.expire_subscriptions() daily instead.';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM extensions.cron.job WHERE jobname = 'expire-subscriptions-daily') THEN
    PERFORM extensions.cron.unschedule('expire-subscriptions-daily');
  END IF;

  -- Daily at 03:00 UTC
  PERFORM extensions.cron.schedule(
    'expire-subscriptions-daily',
    '0 3 * * *',
    'SELECT public.expire_subscriptions();'
  );
END $$;

-- ---------------------------------------------------------------------------
-- 6) Property ownership + listing rights for active subscribers
-- ---------------------------------------------------------------------------
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS properties_owner_idx ON public.properties(owner_id);

CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id
      AND subscription_status = 'active'
      AND subscription_end IS NOT NULL
      AND subscription_end > now()
  );
$$;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid) TO authenticated, service_role;

-- Brokers / property owners with an ACTIVE subscription may create and edit
-- their own listings. Expired users are blocked from creating/updating.
DROP POLICY IF EXISTS "Active subscribers create own properties" ON public.properties;
CREATE POLICY "Active subscribers create own properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid() AND public.has_active_subscription(auth.uid()));

DROP POLICY IF EXISTS "Active subscribers update own properties" ON public.properties;
CREATE POLICY "Active subscribers update own properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() AND public.has_active_subscription(auth.uid()))
  WITH CHECK (owner_id = auth.uid() AND public.has_active_subscription(auth.uid()));

-- Owners keep control of their own data (delete is always allowed).
DROP POLICY IF EXISTS "Owners delete own properties" ON public.properties;
CREATE POLICY "Owners delete own properties"
  ON public.properties FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Public visibility of listings is independent of the owner's subscription:
-- the existing "Anyone can view properties" (USING (true)) policy already
-- guarantees published listings stay online for visitors after expiry.
