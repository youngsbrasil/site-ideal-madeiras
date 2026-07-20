GRANT USAGE ON SCHEMA private TO authenticated;

GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;