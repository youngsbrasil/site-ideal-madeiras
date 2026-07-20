
GRANT SELECT ON public.banners, public.categories, public.products, public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners, public.categories, public.products, public.site_settings TO authenticated;
GRANT ALL ON public.banners, public.categories, public.products, public.site_settings TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
