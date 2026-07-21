CREATE OR REPLACE FUNCTION private.has_any_role(_user_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role = ANY(_roles))
$$;
GRANT EXECUTE ON FUNCTION private.has_any_role(uuid, public.app_role[]) TO authenticated;

CREATE POLICY "catalogo manage products" ON public.products FOR ALL TO authenticated
  USING (private.has_any_role(auth.uid(), ARRAY['admin','catalogo']::public.app_role[]))
  WITH CHECK (private.has_any_role(auth.uid(), ARRAY['admin','catalogo']::public.app_role[]));

CREATE POLICY "catalogo manage categories" ON public.categories FOR ALL TO authenticated
  USING (private.has_any_role(auth.uid(), ARRAY['admin','catalogo']::public.app_role[]))
  WITH CHECK (private.has_any_role(auth.uid(), ARRAY['admin','catalogo']::public.app_role[]));

CREATE POLICY "marketing manage banners" ON public.banners FOR ALL TO authenticated
  USING (private.has_any_role(auth.uid(), ARRAY['admin','marketing']::public.app_role[]))
  WITH CHECK (private.has_any_role(auth.uid(), ARRAY['admin','marketing']::public.app_role[]));

CREATE POLICY "marketing manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (private.has_any_role(auth.uid(), ARRAY['admin','marketing']::public.app_role[]))
  WITH CHECK (private.has_any_role(auth.uid(), ARRAY['admin','marketing']::public.app_role[]));

CREATE POLICY "marketing manage redirects" ON public.redirects FOR ALL TO authenticated
  USING (private.has_any_role(auth.uid(), ARRAY['admin','marketing']::public.app_role[]))
  WITH CHECK (private.has_any_role(auth.uid(), ARRAY['admin','marketing']::public.app_role[]));

CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  user_email text NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NULL,
  details jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_log_created ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);

GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated insert activity" ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins read activity" ON public.activity_log FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));