
-- 1) Add availability column (nullable, no default) to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS availability TEXT;

-- 2) product_variations
CREATE TABLE IF NOT EXISTS public.product_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  atributo TEXT NOT NULL,
  valor TEXT NOT NULL,
  sku TEXT,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_variations_product_id_idx ON public.product_variations(product_id);
GRANT SELECT ON public.product_variations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variations TO authenticated;
GRANT ALL ON public.product_variations TO service_role;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read product_variations" ON public.product_variations FOR SELECT USING (true);
CREATE POLICY "admin manage product_variations" ON public.product_variations FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_product_variations_updated_at BEFORE UPDATE ON public.product_variations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3) product_images (extended gallery)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images(product_id);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "admin manage product_images" ON public.product_images FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_product_images_updated_at BEFORE UPDATE ON public.product_images
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4) product_related
CREATE TABLE IF NOT EXISTS public.product_related (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  related_id UUID NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, related_id)
);
CREATE INDEX IF NOT EXISTS product_related_product_id_idx ON public.product_related(product_id);
GRANT SELECT ON public.product_related TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_related TO authenticated;
GRANT ALL ON public.product_related TO service_role;
ALTER TABLE public.product_related ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read product_related" ON public.product_related FOR SELECT USING (true);
CREATE POLICY "admin manage product_related" ON public.product_related FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
