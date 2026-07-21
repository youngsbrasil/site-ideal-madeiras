CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'google',
  external_id TEXT,
  author_name TEXT NOT NULL,
  author_avatar_url TEXT,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  content TEXT,
  review_date TIMESTAMPTZ,
  language TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  hidden BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  reply TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, external_id)
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT TO anon, authenticated USING (hidden = false);
CREATE POLICY "reviews_admin_all" ON public.reviews FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER reviews_set_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX reviews_featured_idx ON public.reviews (featured) WHERE featured = true;
CREATE INDEX reviews_sort_idx ON public.reviews (sort_order, review_date DESC);

CREATE TABLE public.review_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL,
  scope_ref TEXT,
  layout TEXT NOT NULL DEFAULT 'carousel',
  max_items INTEGER NOT NULL DEFAULT 6,
  min_rating NUMERIC(2,1) NOT NULL DEFAULT 4.0,
  show_average BOOLEAN NOT NULL DEFAULT true,
  show_cta_badge BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scope, scope_ref)
);
GRANT SELECT ON public.review_widgets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_widgets TO authenticated;
GRANT ALL ON public.review_widgets TO service_role;
ALTER TABLE public.review_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "review_widgets_public_read" ON public.review_widgets FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "review_widgets_admin_all" ON public.review_widgets FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER review_widgets_set_updated_at BEFORE UPDATE ON public.review_widgets FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS trustindex_widget_id TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS trustindex_api_key TEXT;