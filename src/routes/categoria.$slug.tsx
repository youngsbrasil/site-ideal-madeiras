import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, ChevronRight, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, fetchSettings, type Product, type Category } from "@/lib/site-data";

export const Route = createFileRoute("/categoria/$slug")({
  loader: async ({ params }) => {
    const { data: cat, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", params.slug)
      .maybeSingle();
    if (error) throw error;
    if (!cat) throw notFound();
    const { data: prods, error: e2 } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", (cat as Category).id)
      .eq("active", true)
      .order("sort_order");
    if (e2) throw e2;
    const products = (prods ?? []).map((p: any) => ({
      ...p,
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
      specifications: Array.isArray(p.specifications) ? p.specifications : [],
    })) as Product[];
    return { category: cat as Category, products };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Categoria não encontrada - Ideal Madeiras" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.category;
    const title = `${c.name} - Lojas Ideal Madeiras`;
    const desc = `Confira nossa seleção de ${c.name.toLowerCase()} na Lojas Ideal Madeiras.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(c.image_url ? [{ property: "og:image", content: c.image_url }] : []),
      ],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold text-[#A7144C]">Categoria não encontrada</h1>
        <Link to="/" className="inline-block mt-6 bg-[#A7144C] text-white px-6 py-3 rounded-full font-semibold">Voltar</Link>
      </div>
    </div>
  ),
  errorComponent: () => <div className="min-h-screen grid place-items-center"><p>Erro ao carregar categoria.</p></div>,
});

function CategoryPage() {
  const { category, products } = Route.useLoaderData() as { category: Category; products: Product[] };
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: categorias = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const whatsapp = (settings?.site.whatsapp || "5511942000000").replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${whatsapp}`;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <img src="https://idealmadeiras.com.br/wp-content/uploads/2024/09/logo-ideal-madeiras.png" alt="Lojas Ideal Madeiras" className="h-12 w-auto" />
          </Link>
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="hidden md:inline-flex items-center gap-2 text-sm bg-[#25D366] hover:bg-[#1eb659] text-white px-4 py-2 rounded-full font-semibold">
            <MessageCircle size={16} /> Compre pelo WhatsApp
          </a>
        </div>
      </header>

      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 text-xs text-neutral-600">
          <Link to="/" className="hover:text-[#A7144C]">Início</Link>
          <ChevronRight size={12} />
          <span className="text-neutral-900 font-medium">{category.name}</span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="hidden md:block">
          <h3 className="font-bold text-sm mb-4 border-b-2 border-[#A7144C] pb-2 inline-block">CATEGORIAS</h3>
          <ul className="space-y-2 text-sm">
            {categorias.map((c) => (
              <li key={c.id}>
                <Link
                  to="/categoria/$slug"
                  params={{ slug: c.slug }}
                  className={`hover:text-[#A7144C] ${c.id === category.id ? "text-[#A7144C] font-semibold" : "text-neutral-700"}`}
                >
                  {c.name} <span className="text-neutral-400">({c.product_count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-sm text-neutral-500 mt-1">{products.length} produto{products.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="border border-dashed border-neutral-300 rounded-lg p-12 text-center text-neutral-500">
              Nenhum produto disponível nesta categoria no momento.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {products.map((p) => (
                <Link
                  key={p.id}
                  to="/produto/$slug"
                  params={{ slug: p.slug }}
                  className="group border border-neutral-200 rounded-lg overflow-hidden bg-white hover:shadow-lg hover:border-[#A7144C]/40 transition-all block"
                >
                  <div className="relative aspect-square bg-neutral-50 overflow-hidden">
                    {p.main_image && (
                      <img src={p.main_image} alt={p.name} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                    )}
                    <span className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 grid place-items-center text-neutral-600 shadow">
                      <Heart size={16} />
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      {p.old_price && <span className="text-xs text-neutral-400 line-through">{p.old_price}</span>}
                      <span className="font-bold text-[#A7144C]">{p.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <a href={whatsappHref} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#1eb659] text-white rounded-full w-14 h-14 grid place-items-center shadow-lg z-50" aria-label="WhatsApp">
        <MessageCircle size={26} />
      </a>
    </div>
  );
}
