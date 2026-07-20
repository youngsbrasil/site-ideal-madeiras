
CREATE TABLE public.hotspots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_key text NOT NULL,
  x numeric NOT NULL DEFAULT 50,
  y numeric NOT NULL DEFAULT 50,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  label text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX hotspots_image_key_idx ON public.hotspots(image_key);

GRANT SELECT ON public.hotspots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotspots TO authenticated;
GRANT ALL ON public.hotspots TO service_role;

ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read hotspots" ON public.hotspots FOR SELECT USING (true);
CREATE POLICY "admins manage hotspots" ON public.hotspots FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
