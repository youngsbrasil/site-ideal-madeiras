import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  product_count: number;
  sort_order: number;
};

export type Product = {
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
};

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  active: boolean;
};

export type SiteSettings = {
  nome?: string;
  whatsapp?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
};
export type TopbarSettings = { texto?: string };

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
  return (data ?? []).map((p: any) => ({
    ...p,
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
  })) as Product[];
}

export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    ...p,
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
  })) as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...(data as any),
    gallery: Array.isArray((data as any).gallery) ? (data as any).gallery : [],
    specifications: Array.isArray((data as any).specifications) ? (data as any).specifications : [],
  } as Product;
}

export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase.from("banners").select("*").eq("active", true).order("sort_order");
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
