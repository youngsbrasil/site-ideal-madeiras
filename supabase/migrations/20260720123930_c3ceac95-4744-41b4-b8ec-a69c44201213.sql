
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text,
  product_count int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  price text NOT NULL,
  old_price text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  main_image text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text,
  specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  most_viewed boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Banners
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  image_url text NOT NULL,
  link_url text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT ALL ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read banners" ON public.banners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage banners" ON public.banners FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_banners_updated BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Site settings (key/value)
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create user row + assign admin to first user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role='admin') THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed categories
INSERT INTO public.categories (name, slug, image_url, product_count, sort_order) VALUES
('ACESSÓRIOS','acessorios','https://idealmadeiras.com.br/wp-content/uploads/2024/10/THUMB-ACESSORIOS-768x768.png',40,1),
('FECHADURAS','fechaduras','https://idealmadeiras.com.br/wp-content/uploads/2024/10/THUMB-FECHADURAS-768x768.png',62,2),
('JANELAS','janelas','https://idealmadeiras.com.br/wp-content/uploads/2024/10/THUMB-JANELAS-768x768.png',6,3),
('PORTAS','portas','https://idealmadeiras.com.br/wp-content/uploads/2024/10/THUMB-PORTAS-768x768.png',110,4),
('PUXADORES','puxadores','https://idealmadeiras.com.br/wp-content/uploads/2024/10/THUMB-PUXADORES-768x768.png',23,5),
('VITRÔS','vitros','https://idealmadeiras.com.br/wp-content/uploads/2024/10/THUMB-VITROS-768x768.png',12,6);

-- Seed products
WITH data(nome, preco, precoAntigo, categoria_slug, img, featured, most_viewed) AS (VALUES
('Porta de Correr 03 Folhas Panorâmica com Almofada Especial','R$ 3.499,00',NULL,'portas','https://idealmadeiras.com.br/wp-content/uploads/2024/10/PORTA-DE-CORRER-03-FOLHAS-PANORAMICA-COM-ALMOFADA-ESPECIAL-800x800.png',true,true),
('Porta Maciça Paris Cedro Arana','R$ 1.290,00',NULL,'portas','https://idealmadeiras.com.br/wp-content/uploads/2021/08/PORTA-MACICA-PARIS-CEDRO-ARANA-800x800.png',true,true),
('Conjunto Renolit Branco com Demolição','R$ 2.750,00',NULL,'portas','https://idealmadeiras.com.br/wp-content/uploads/2021/08/CONJUNTO-RENOLIT-BRANCO-COM-DEMOLICAO-800x800.png',true,false),
('Conjunto Pivotante Painel Clean Cedro Arana','R$ 3.190,00',NULL,'portas','https://idealmadeiras.com.br/wp-content/uploads/2024/10/CONJUNTO-PIVOTANTE-COM-PAINEL-CLEAN-CEDRO-ARANA-800x800.png',true,false),
('Conjunto Pivotante Mexicana Horizontal com Visor Curvo','R$ 3.590,00',NULL,'portas','https://idealmadeiras.com.br/wp-content/uploads/2021/08/CONJUNTO-PIVOTANTE-MEXICANA-HORIZONTAL-COM-VISOR-CURVO-CEDRO-ARANA-800x800.png',true,true),
('Conjunto Pivotante Suíça Cedro Arana','R$ 2.990,00',NULL,'portas','https://idealmadeiras.com.br/wp-content/uploads/2021/08/CONJUNTO-PIVOTANTE-SUICA-CEDRO-ARANA-800x800.png',true,false),
('Par de Puxadores 733 Verona Inox Cromado 100cm','R$ 489,00',NULL,'puxadores','https://idealmadeiras.com.br/wp-content/uploads/2024/11/PAR-DE-PUXADORES-733-VERONA-INOX-CROMADO-100CM-800x800.png',false,true),
('Fechadura Pado Bico de Papagaio Duplo Externa Escovada','R$ 349,00',NULL,'fechaduras','https://idealmadeiras.com.br/wp-content/uploads/2026/01/FECHADURA-PADO-BICO-DE-PAPAGAIO-DUPLO-EXTERNA-ESCOVADA.png',false,true),
('Fechadura Odin Cromo Acetinado Imab','R$ 299,00',NULL,'fechaduras','https://idealmadeiras.com.br/wp-content/uploads/2024/11/FECHADURA-ODIN-CROMO-ACETINADO-IMAB-1-800x800.png',false,true),
('Piso Pronto de Madeira Maciça Tauari','R$ 219,00',NULL,'acessorios','https://idealmadeiras.com.br/wp-content/uploads/2024/11/PISO-PRONTO-DE-MADEIRA-MACICA-TAUARI-800x800.png',false,true),
('Puxador Alumínio Concha de Embutir Preto','R$ 89,00',NULL,'puxadores','https://idealmadeiras.com.br/wp-content/uploads/2024/11/PUXADOR-ALUMINIO-CONCHA-DE-EMBUTIR-PRETO-1-800x800.png',false,true),
('Fechadura Bico Papagaio Cilindro Duplo Preta','R$ 319,00',NULL,'fechaduras','https://idealmadeiras.com.br/wp-content/uploads/2024/11/FECHADURA-BICO-PAPAGAIO-CILINDRO-DUPLO-PRETA-800x800.png',false,true),
('Fechadura Rolete com Lingueta Preta Redonda Arouca','R$ 189,00',NULL,'fechaduras','https://idealmadeiras.com.br/wp-content/uploads/2024/11/FECHADURA-ROLETE-COM-LINGUETA-PRETA-REDONDA-AROUCA-800x800.png',false,true),
('Par de Levantador para Janela','R$ 79,00',NULL,'acessorios','https://idealmadeiras.com.br/wp-content/uploads/2024/11/PAR-DE-LEVANTADOR-PARA-JANELA-800x800.png',false,true),
('Fechadura Pado Digital 800 Vision','R$ 1.499,00','R$ 1.899,00','fechaduras','https://idealmadeiras.com.br/wp-content/uploads/2026/01/FECHADURA-PADO-DIGITAL-800-VISION-5-800x800.png',false,true)
)
INSERT INTO public.products (slug, name, price, old_price, category_id, main_image, gallery, description, specifications, featured, most_viewed)
SELECT
  lower(regexp_replace(regexp_replace(translate(d.nome,'ãâáàäéêèëíîïóôõöúûüçÃÂÁÀÄÉÊÈËÍÎÏÓÔÕÖÚÛÜÇ','aaaaaeeeeiiiooooouuucAAAAAEEEEIIIOOOOOUUUC'), '[^a-zA-Z0-9]+','-','g'), '(^-|-$)','','g')),
  d.nome, d.preco, d.precoAntigo,
  c.id,
  d.img,
  jsonb_build_array(d.img, d.img, d.img, d.img),
  d.nome || ' — produto de alta qualidade, com acabamento premium e garantia de fábrica. Ideal para quem busca durabilidade, design e sofisticação para sua obra ou reforma. Enviamos para todo o Brasil com embalagem reforçada e suporte especializado da equipe Lojas Ideal Madeiras.',
  jsonb_build_array(
    jsonb_build_object('label','Categoria','valor', upper(c.name)),
    jsonb_build_object('label','Marca','valor','Ideal Madeiras'),
    jsonb_build_object('label','Garantia','valor','12 meses de fábrica'),
    jsonb_build_object('label','Origem','valor','Nacional'),
    jsonb_build_object('label','Condição','valor','Produto novo')
  ),
  d.featured, d.most_viewed
FROM data d LEFT JOIN public.categories c ON c.slug = d.categoria_slug;

-- Seed banner + settings
INSERT INTO public.banners (title, subtitle, image_url, link_url, sort_order, active) VALUES
('Portas, Janelas e Ferragens','Compre pelo WhatsApp com desconto especial','https://idealmadeiras.com.br/wp-content/uploads/2024/11/COMPRE-PELO-WHATSAPP.png','https://wa.me/5511942000000',1,true);

INSERT INTO public.site_settings (key, value) VALUES
('site',  '{"nome":"Lojas Ideal Madeiras","whatsapp":"5511942000000","email":"contato@idealmadeiras.com.br","telefone":"(11) 4200-0000","endereco":"São Paulo - SP"}'::jsonb),
('topbar','{"texto":"Frete grátis para São Paulo em compras acima de R$ 1.500 • Parcelamos em até 12x"}'::jsonb),
('cores', '{"primaria":"#0F5132","secundaria":"#FBB040"}'::jsonb);
