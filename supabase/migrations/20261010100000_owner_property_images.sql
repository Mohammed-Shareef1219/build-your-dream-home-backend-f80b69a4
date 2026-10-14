-- ============================================================================
-- Owner property listing images
--
-- Complements 20261007090000_subscription_packages.sql: brokers / property
-- owners with an ACTIVE subscription may upload photos for their own listings
-- to the (existing) property-images storage bucket. Admins keep full access.
-- Public read stays open so published listings keep rendering after expiry.
-- ============================================================================

DROP POLICY IF EXISTS "Active subscribers upload property images" ON storage.objects;
CREATE POLICY "Active subscribers upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Owners update own property images" ON storage.objects;
CREATE POLICY "Owners update own property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Owners delete own property images" ON storage.objects;
CREATE POLICY "Owners delete own property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Owners list own property images" ON storage.objects;
CREATE POLICY "Owners list own property images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
