import { supabase } from "@/integrations/supabase/client";

export type SeoFields = {
  meta_title?: string | null;
  meta_description?: string | null;
  canonical?: string | null;
  og_image?: string | null;
  noindex?: boolean | null;
};

export type Category = SeoFields & {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  product_count: number;
  sort_order: number;
  parent_id?: string | null;
};

export type Product = SeoFields & {
  id: string;
  slug: string;
  name: string;
  price: string;
  old_price: string | null;
  category_id: string | null;
  main_image: string | null;
  gallery: string[];
  description: string | null;
  specifications: { label: string; valor: string }[];
  featured: boolean;
  most_viewed: boolean;
  active: boolean;
  sort_order: number;
  sizes: string[];
  types: string[];
  woods: string[];
  finishes: string[];
  price_value: number | null;
  availability?: string | null;
  created_at?: string;
};

export type ProductVariation = {
  id: string;
  product_id: string;
  atributo: string;
  valor: string;
  sku: string | null;
  disponivel: boolean;
  ordem: number;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  ordem: number;
};

export type ProductRelated = {
  id: string;
  product_id: string;
  related_id: string;
  ordem: number;
};

export function formatPriceDisplay(p: { price?: string | null; price_value?: number | null; availability?: string | null }): string {
  if (p.availability === "sob_consulta") return "Sob consulta";
  if (p.availability === "esgotado") return "Esgotado";
  if (typeof p.price_value === "number" && !isNaN(p.price_value) && p.price_value > 0) {
    return p.price_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  const s = (p.price ?? "").trim();
  if (!s) return "Sob consulta";
  // if it looks like currency (contains R$ or digits) show as-is, otherwise treat as no price
  if (/r\$|\d/i.test(s)) return s;
  return "Sob consulta";
}

export async function fetchProductVariations(productId: string): Promise<ProductVariation[]> {
  const { data, error } = await supabase.from("product_variations" as any).select("*").eq("product_id", productId).order("ordem");
  if (error) throw error;
  return (data ?? []) as unknown as ProductVariation[];
}

export async function fetchProductImages(productId: string): Promise<ProductImage[]> {
  const { data, error } = await supabase.from("product_images" as any).select("*").eq("product_id", productId).order("ordem");
  if (error) throw error;
  return (data ?? []) as unknown as ProductImage[];
}

export async function fetchProductRelated(productId: string): Promise<ProductRelated[]> {
  const { data, error } = await supabase.from("product_related" as any).select("*").eq("product_id", productId).order("ordem");
  if (error) throw error;
  return (data ?? []) as unknown as ProductRelated[];
}


export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  active: boolean;
  start_at?: string | null;
  end_at?: string | null;
};

export type Coupon = {
  id: string;
  codigo: string;
  tipo: "percentual" | "valor_fixo";
  valor: number;
  validade_inicio: string | null;
  validade_fim: string | null;
  uso_maximo: number | null;
  usos_atuais: number;
  ativo: boolean;
  categorias_aplicaveis: string[];
  valor_minimo_pedido: number | null;
  descricao: string | null;
  destacar_no_site: boolean;
};

export async function fetchFeaturedCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from("coupons" as any)
    .select("*")
    .eq("ativo", true)
    .eq("destacar_no_site", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Coupon[];
}

export async function fetchCouponByCode(code: string): Promise<Coupon | null> {
  const trimmed = code.trim();
  if (!trimmed) return null;
  const { data, error } = await supabase
    .from("coupons" as any)
    .select("*")
    .ilike("codigo", trimmed)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as Coupon) || null;
}

export function parsePriceBRL(input: string | null | undefined): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isFinite(n) ? n : 0;
}

export type CouponValidation =
  | { ok: true; coupon: Coupon; desconto: number; total: number }
  | { ok: false; error: string };

export function validateCoupon(coupon: Coupon | null, subtotal: number): CouponValidation {
  if (!coupon) return { ok: false, error: "Cupom não encontrado." };
  if (!coupon.ativo) return { ok: false, error: "Cupom inativo." };
  const now = Date.now();
  if (coupon.validade_inicio && new Date(coupon.validade_inicio).getTime() > now)
    return { ok: false, error: "Cupom ainda não iniciou." };
  if (coupon.validade_fim && new Date(coupon.validade_fim).getTime() < now)
    return { ok: false, error: "Cupom expirado." };
  if (coupon.uso_maximo != null && coupon.usos_atuais >= coupon.uso_maximo)
    return { ok: false, error: "Cupom esgotou os usos disponíveis." };
  if (coupon.valor_minimo_pedido != null && subtotal < coupon.valor_minimo_pedido)
    return { ok: false, error: `Pedido mínimo de ${coupon.valor_minimo_pedido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.` };
  const desconto = coupon.tipo === "percentual"
    ? subtotal * (coupon.valor / 100)
    : Math.min(coupon.valor, subtotal);
  return { ok: true, coupon, desconto, total: Math.max(0, subtotal - desconto) };
}

export type Redirect = {
  id: string;
  url_origem: string;
  url_destino: string;
  tipo: number;
  ativo: boolean;
  hits: number;
};

export async function fetchRedirects(): Promise<Redirect[]> {
  const { data, error } = await supabase.from("redirects" as any).select("*").order("url_origem");
  if (error) throw error;
  return (data ?? []) as unknown as Redirect[];
}

export type ShoppablePin = {
  id: string;
  scene_id: string;
  product_id: string | null;
  x: number;
  y: number;
  label: string | null;
};

export type ShoppableScene = {
  id: string;
  title: string | null;
  image_url: string;
  active: boolean;
  sort_order: number;
  pins: ShoppablePin[];
};

export type SiteSettings = {
  nome?: string;
  whatsapp?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  trustindex_widget_id?: string;
};
export type TopbarSettings = { texto?: string };

export type Review = {
  id: string;
  source: string;
  external_id: string | null;
  author_name: string;
  author_avatar_url: string | null;
  rating: number;
  content: string | null;
  review_date: string | null;
  language: string | null;
  featured: boolean;
  hidden: boolean;
  sort_order: number;
  reply: string | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewWidget = {
  id: string;
  scope: "home" | "category" | "product" | "global";
  scope_ref: string | null;
  layout: "carousel" | "grid" | "compact" | "badge";
  max_items: number;
  min_rating: number;
  show_average: boolean;
  show_cta_badge: boolean;
  active: boolean;
};

export async function fetchPublicReviews(opts?: { featuredOnly?: boolean; minRating?: number; limit?: number }): Promise<Review[]> {
  let q = supabase.from("reviews" as any).select("*").eq("hidden", false);
  if (opts?.featuredOnly) q = q.eq("featured", true);
  if (opts?.minRating != null) q = q.gte("rating", opts.minRating);
  q = q.order("featured", { ascending: false }).order("sort_order").order("review_date", { ascending: false });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as Review[];
}

export async function fetchReviewsStats(): Promise<{ average: number; total: number }> {
  const { data, error } = await supabase.from("reviews" as any).select("rating").eq("hidden", false);
  if (error) throw error;
  const arr = (data ?? []) as unknown as { rating: number }[];
  if (arr.length === 0) return { average: 0, total: 0 };
  const avg = arr.reduce((s, r) => s + Number(r.rating), 0) / arr.length;
  return { average: Math.round(avg * 10) / 10, total: arr.length };
}

export async function fetchReviewWidget(scope: ReviewWidget["scope"], scopeRef?: string | null): Promise<ReviewWidget | null> {
  let q = supabase.from("review_widgets" as any).select("*").eq("scope", scope).eq("active", true);
  q = scopeRef ? q.eq("scope_ref", scopeRef) : q.is("scope_ref", null);
  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as ReviewWidget | null;
}


export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(normalizeProduct) as Product[];
}

function normalizeProduct(p: any): Product {
  return {
    ...p,
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    types: Array.isArray(p.types) ? p.types : [],
    woods: Array.isArray(p.woods) ? p.woods : [],
    finishes: Array.isArray(p.finishes) ? p.finishes : [],
  };
}

export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeProduct) as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return normalizeProduct(data);
}

export async function fetchShoppableScenes(activeOnly = true): Promise<ShoppableScene[]> {
  let q = supabase.from("shoppable_scenes").select("*").order("sort_order");
  if (activeOnly) q = q.eq("active", true);
  const { data: scenes, error } = await q;
  if (error) throw error;
  if (!scenes || scenes.length === 0) return [];
  const ids = scenes.map((s: any) => s.id);
  const { data: pins, error: pErr } = await supabase.from("shoppable_pins").select("*").in("scene_id", ids);
  if (pErr) throw pErr;
  return (scenes as any[]).map((s) => ({
    ...s,
    pins: ((pins ?? []) as any[]).filter((p) => p.scene_id === s.id).map((p) => ({
      ...p, x: Number(p.x), y: Number(p.y),
    })),
  })) as ShoppableScene[];
}

export async function fetchBanners(): Promise<Banner[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("active", true)
    .or(`start_at.is.null,start_at.lte.${nowIso}`)
    .or(`end_at.is.null,end_at.gte.${nowIso}`)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Banner[];
}


export async function fetchSettings(): Promise<{ site: SiteSettings; topbar: TopbarSettings }> {
  const { data, error } = await supabase.from("site_settings").select("*");
  if (error) throw error;
  const map: Record<string, any> = {};
  (data ?? []).forEach((r: any) => (map[r.key] = r.value));
  return { site: map.site ?? {}, topbar: map.topbar ?? {} };
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Builds the canonical URL for a product: /categoria/[subcategoria]/produto-slug.
 * Falls back to /produto/<slug> when the category chain cannot be resolved.
 */
export function productPath(product: Product, categories: Category[]): string {
  const cat = categories.find((c) => c.id === product.category_id);
  if (!cat) return `/produto/${product.slug}`;
  const parent = cat.parent_id ? categories.find((c) => c.id === cat.parent_id) : null;
  const parts = parent ? [parent.slug, cat.slug, product.slug] : [cat.slug, product.slug];
  return "/" + parts.map(encodeURIComponent).join("/");
}

/**
 * Proxy remote images through images.weserv.nl to bypass hotlink protection / rate limits
 * on the original idealmadeiras.com.br host. Leaves local, data:, blob:, and Supabase URLs alone.
 */
export function proxyImg(url: string | null | undefined): string {
  if (!url) return "";
  if (/^(data:|blob:|\/)/.test(url)) return url;
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("supabase.co") || u.hostname.includes("localhost")) return url;
    // weserv expects url without protocol
    const stripped = url.replace(/^https?:\/\//, "");
    return `https://images.weserv.nl/?url=${encodeURIComponent(stripped)}`;
  } catch {
    return url;
  }
}
