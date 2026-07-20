CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY IF EXISTS "admins manage banners" ON public.banners;
CREATE POLICY "admins manage banners" ON public.banners
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins manage categories" ON public.categories;
CREATE POLICY "admins manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins manage products" ON public.products;
CREATE POLICY "admins manage products" ON public.products
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins manage settings" ON public.site_settings;
CREATE POLICY "admins manage settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins read all roles" ON public.user_roles;
CREATE POLICY "admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins upload media" ON storage.objects;
CREATE POLICY "admins upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins update media" ON storage.objects;
CREATE POLICY "admins update media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'media' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "admins delete media" ON storage.objects;
CREATE POLICY "admins delete media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
