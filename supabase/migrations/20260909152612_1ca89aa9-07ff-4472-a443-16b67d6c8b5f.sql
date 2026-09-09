DROP POLICY IF EXISTS "public read media" ON storage.objects;

CREATE POLICY "public read media public folders"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] IN ('uploads','library','banners','produtos','shoppable')
);

CREATE POLICY "authenticated read media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'media');
