CREATE TABLE public.products_backup (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_id UUID NOT NULL,
  product_id UUID NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL,
  reason TEXT NULL
);
CREATE INDEX products_backup_snapshot_idx ON public.products_backup(snapshot_id);
CREATE INDEX products_backup_created_at_idx ON public.products_backup(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products_backup TO authenticated;
GRANT ALL ON public.products_backup TO service_role;
ALTER TABLE public.products_backup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage products_backup" ON public.products_backup FOR ALL TO authenticated
  USING (private.has_any_role(auth.uid(), ARRAY['admin','catalogo']::app_role[]))
  WITH CHECK (private.has_any_role(auth.uid(), ARRAY['admin','catalogo']::app_role[]));

CREATE TABLE public.import_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT NOT NULL,
  source TEXT NOT NULL,
  created_count INT NOT NULL DEFAULT 0,
  updated_count INT NOT NULL DEFAULT 0,
  removed_count INT NOT NULL DEFAULT 0,
  snapshot_id UUID NULL,
  status TEXT NOT NULL DEFAULT 'success',
  error TEXT NULL,
  user_id UUID NULL,
  user_email TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX import_log_created_at_idx ON public.import_log(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_log TO authenticated;
GRANT ALL ON public.import_log TO service_role;
ALTER TABLE public.import_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage import_log" ON public.import_log FOR ALL TO authenticated
  USING (private.has_any_role(auth.uid(), ARRAY['admin','catalogo']::app_role[]))
  WITH CHECK (private.has_any_role(auth.uid(), ARRAY['admin','catalogo']::app_role[]));