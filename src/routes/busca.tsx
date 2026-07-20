import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SupabaseImage } from "@/components/SupabaseImage";
import type { Product, Category } from "@/lib/site-data";

type BuscaSearch = { q: string; categoria: string };

export const Route = createFileRoute("/busca")({
  validateSearch: (s: Record<string, unknown>): BuscaSearch => ({
    q: typeof s.q === "string" ? s.q : "",
    categoria: typeof s.categoria === "string" ? s.categoria : "",
  }),
  component: BuscaPage,
  head: () => ({
    meta: [
      { title: "Busca - Lojas Ideal Madeiras" },
      { name: "description", content: "Resultados da busca de produtos na Lojas Ideal Madeiras." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

async function fetchResults(q: string, categoriaSlug: string) {
  let categoryId: string | null = null;
  if (categoriaSlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categoriaSlug)
      .maybeSingle();
    categoryId = (cat as { id: string } | null)?.id ?? null;
  }
  let query = supabase.from("products").select("*").eq("active", true);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);
  const { data, error } = await query.order("sort_order").limit(60);
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    ...p,
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
  })) as Product[];
}

function BuscaPage() {
  const { q, categoria } = Route.useSearch();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["search", q, categoria],
    queryFn: () => fetchResults(q, categoria),
  });
  const { data: cat } = useQuery({
    queryKey: ["category-by-slug", categoria],
    queryFn: async () => {
      if (!categoria) return null;
      const { data } = await supabase.from("categories").select("*").eq("slug", categoria).maybeSingle();
      return data as Category | null;
    },
  });

  const heading = useMemo(() => {
    const parts: string[] = [];
    if (q) parts.push(`"${q}"`);
    if (cat) parts.push(`em ${cat.name}`);
    return parts.length ? `Resultados para ${parts.join(" ")}` : "Todos os produtos";
  }, [q, cat]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0b1a34] mb-6">{heading}</h1>
        {isLoading ? (
          <p className="text-neutral-500">Buscando...</p>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg p-10 text-center border">
            <p className="text-neutral-600">Nenhum produto encontrado.</p>
            <Link to="/" className="inline-block mt-4 bg-[#A7144C] text-white px-6 py-3 rounded-full font-semibold">Voltar</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
                <Link to="/produto/$slug" params={{ slug: p.slug }} className="block">
                  <div className="aspect-square bg-neutral-100 overflow-hidden">
                    <SupabaseImage
                      src={p.main_image ?? undefined}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-neutral-800 line-clamp-2 min-h-[40px]">{p.name}</h3>
                    <p className="mt-2 text-[#A7144C] font-bold">{p.price}</p>
                  </div>
                </Link>
                <div className="px-3 pb-3 mt-auto">
                  <Link to="/checkout" search={{ slug: p.slug, qty: 1 }} className="block w-full text-center bg-[#A7144C] hover:bg-[#8b1140] text-white text-xs font-semibold py-2 rounded-full">
                    SOLICITAR ORÇAMENTO
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
