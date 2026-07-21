CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL DEFAULT 'media',
  folder text,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint,
  width int,
  height int,
  full_path text NOT NULL,
  medium_path text,
  thumb_path text,
  alt text,
  tags text[] DEFAULT '{}',
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX media_assets_folder_idx ON public.media_assets(folder);
CREATE INDEX media_assets_created_idx ON public.media_assets(created_at DESC);
CREATE INDEX media_assets_tags_idx ON public.media_assets USING gin(tags);
CREATE INDEX media_assets_search_idx ON public.media_assets
  USING gin (to_tsvector('simple', coalesce(original_name,'') || ' ' || coalesce(alt,'')));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_assets_select_auth"
  ON public.media_assets FOR SELECT TO authenticated USING (true);

CREATE POLICY "media_assets_insert_staff"
  ON public.media_assets FOR INSERT TO authenticated
  WITH CHECK (
    private.has_any_role(auth.uid(), ARRAY['admin','catalogo','marketing']::app_role[])
  );

CREATE POLICY "media_assets_update_staff"
  ON public.media_assets FOR UPDATE TO authenticated
  USING (
    private.has_any_role(auth.uid(), ARRAY['admin','catalogo','marketing']::app_role[])
  );

CREATE POLICY "media_assets_delete_staff"
  ON public.media_assets FOR DELETE TO authenticated
  USING (
    private.has_any_role(auth.uid(), ARRAY['admin','catalogo','marketing']::app_role[])
  );

CREATE TRIGGER media_assets_set_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();