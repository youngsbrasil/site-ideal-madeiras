
-- NOVA tabela: coupons
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('percentual', 'valor_fixo')),
  valor NUMERIC(12,2) NOT NULL,
  validade_inicio TIMESTAMPTZ,
  validade_fim TIMESTAMPTZ,
  uso_maximo INTEGER,
  usos_atuais INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  categorias_aplicaveis UUID[] NOT NULL DEFAULT '{}',
  valor_minimo_pedido NUMERIC(12,2),
  descricao TEXT,
  destacar_no_site BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coupons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active coupons" ON public.coupons FOR SELECT
  USING (
    ativo = true
    AND (validade_inicio IS NULL OR validade_inicio <= now())
    AND (validade_fim IS NULL OR validade_fim >= now())
  );

CREATE POLICY "admin manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX coupons_codigo_idx ON public.coupons (LOWER(codigo));

-- Agendamento de banners (colunas nullable, não altera dados existentes)
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;
