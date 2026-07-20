
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS types text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS woods text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS finishes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price_value numeric;
