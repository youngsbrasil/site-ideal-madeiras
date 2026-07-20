
CREATE TABLE public.shoppable_scenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shoppable_scenes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.shoppable_scenes TO authenticated;
GRANT ALL ON public.shoppable_scenes TO service_role;
ALTER TABLE public.shoppable_scenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read shoppable_scenes" ON public.shoppable_scenes FOR SELECT USING (true);
CREATE POLICY "auth manage shoppable_scenes" ON public.shoppable_scenes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.shoppable_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID NOT NULL REFERENCES public.shoppable_scenes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shoppable_pins TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.shoppable_pins TO authenticated;
GRANT ALL ON public.shoppable_pins TO service_role;
ALTER TABLE public.shoppable_pins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read shoppable_pins" ON public.shoppable_pins FOR SELECT USING (true);
CREATE POLICY "auth manage shoppable_pins" ON public.shoppable_pins FOR ALL TO authenticated USING (true) WITH CHECK (true);
