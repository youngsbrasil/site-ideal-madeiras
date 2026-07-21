
CREATE TABLE public.redirects (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url_origem   text NOT NULL,
  url_destino  text NOT NULL,
  tipo         smallint NOT NULL DEFAULT 301 CHECK (tipo IN (301, 302)),
  ativo        boolean NOT NULL DEFAULT true,
  hits         integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT redirects_origem_unique UNIQUE (url_origem)
);

CREATE INDEX redirects_origem_ativo_idx
  ON public.redirects (url_origem) WHERE ativo = true;

GRANT SELECT ON public.redirects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.redirects TO authenticated;
GRANT ALL ON public.redirects TO service_role;

ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "redirects_public_read"
  ON public.redirects FOR SELECT
  USING (ativo = true);

CREATE POLICY "redirects_admin_all"
  ON public.redirects FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_redirects_updated_at
  BEFORE UPDATE ON public.redirects
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS meta_title       text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS canonical        text,
  ADD COLUMN IF NOT EXISTS og_image         text,
  ADD COLUMN IF NOT EXISTS noindex          boolean;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS meta_title       text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS canonical        text,
  ADD COLUMN IF NOT EXISTS og_image         text,
  ADD COLUMN IF NOT EXISTS noindex          boolean;
