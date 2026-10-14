
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Recreate all policies using private.has_role
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Profiles visible to owner and admins" ON public.profiles;
CREATE POLICY "Profiles visible to owner and admins" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage properties" ON public.properties;
CREATE POLICY "Admins manage properties" ON public.properties
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins view inquiries" ON public.inquiries;
CREATE POLICY "Admins view inquiries" ON public.inquiries
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update inquiries" ON public.inquiries;
CREATE POLICY "Admins update inquiries" ON public.inquiries
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete inquiries" ON public.inquiries;
CREATE POLICY "Admins delete inquiries" ON public.inquiries
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins view consultations" ON public.consultations;
CREATE POLICY "Admins view consultations" ON public.consultations
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update consultations" ON public.consultations;
CREATE POLICY "Admins update consultations" ON public.consultations
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete consultations" ON public.consultations;
CREATE POLICY "Admins delete consultations" ON public.consultations
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins upload property images" ON storage.objects;
CREATE POLICY "Admins upload property images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-images' AND private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update property images" ON storage.objects;
CREATE POLICY "Admins update property images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'property-images' AND private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete property images" ON storage.objects;
CREATE POLICY "Admins delete property images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'property-images' AND private.has_role(auth.uid(), 'admin'));

-- Restrict public listing of the property-images bucket.
-- Public getPublicUrl continues to work via the CDN — this only blocks storage.objects listing.
DROP POLICY IF EXISTS "Public read property images" ON storage.objects;
CREATE POLICY "Admins list property images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'property-images' AND private.has_role(auth.uid(), 'admin'));

-- Drop the public-schema function; nothing depends on it now.
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
