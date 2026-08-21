import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Heart, ChevronRight, MessageCircle, SlidersHorizontal, X, LayoutGrid, Grid3x3, Grid2x2, ChevronLeft, ChevronRight as ChevRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, fetchSettings, productPath, formatPriceDisplay, type Product, type Category } from "@/lib/site-data";
import { SupabaseImage } from "@/components/SupabaseImage";
import { SiteHeader } from "@/components/SiteHeader";
import { categoryMetaTitle, categoryMetaDescription, absoluteUrl, breadcrumbJsonLd, organizationJsonLd, localBusinessJsonLd, SITE_NAME } from "@/lib/seo";

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
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      types: Array.isArray(p.types) ? p.types : [],
      woods: Array.isArray(p.woods) ? p.woods : [],
      finishes: Array.isArray(p.finishes) ? p.finishes : [],
    })) as Product[];
    const { data: settings } = await supabase.from("site_settings").select("*");
    const settingsMap: any = {};
    (settings ?? []).forEach((r: any) => (settingsMap[r.key] = r.value));
    return { 
      category: cat as Category, 
      products, 
      settings: { 
        site: settingsMap.site ?? {},
        topbar: settingsMap.topbar ?? {},
        lojas: settingsMap.lojas ?? [],
        prova_social: settingsMap.prova_social ?? {},
        cores: settingsMap.cores ?? {},
      } 
    };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Categoria não encontrada - Ideal Madeiras" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.category;
    const title = categoryMetaTitle(c);
    const desc = categoryMetaDescription(c);
    const url = c.canonical || absoluteUrl(`/categoria/${params.slug}`);
    const img = c.og_image || c.image_url;
    const crumbs = breadcrumbJsonLd([
      { name: SITE_NAME, url: absoluteUrl("/") },
      { name: c.name, url },
    ]);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        ...(c.noindex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        ...(img ? [{ property: "og:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      script: [
        { type: "application/ld+json", children: JSON.stringify(crumbs) },
        { type: "application/ld+json", children: JSON.stringify(organizationJsonLd()) },
        { type: "application/ld+json", children: JSON.stringify(localBusinessJsonLd(loaderData.settings)) },
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

type FilterKey = "sizes" | "types" | "woods" | "finishes";
const FILTER_LABELS: Record<FilterKey, string> = {
  sizes: "Tamanho",
  types: "Tipo",
  woods: "Madeira",
  finishes: "Acabamento",
};

function CategoryPage() {
  const { category, products } = Route.useLoaderData() as { category: Category; products: Product[] };
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: categorias = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const whatsapp = (settings?.site.whatsapp || "").replace(/\D/g, "");
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}` : null;

  const [selected, setSelected] = useState<Record<FilterKey, string[]>>({
    sizes: [], types: [], woods: [], finishes: [],
  });
  const priceBounds = useMemo(() => {
    const vals = products.map((p) => p.price_value ?? 0).filter((v) => v > 0);
    if (!vals.length) return { min: 0, max: 0 };
    return { min: Math.floor(Math.min(...vals)), max: Math.ceil(Math.max(...vals)) };
  }, [products]);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const activePriceMax = priceMax ?? priceBounds.max;

  const options = useMemo(() => {
    const collect = (key: FilterKey) => {
      const s = new Set<string>();
      products.forEach((p) => (p[key] as string[]).forEach((v) => v && s.add(v)));
      return Array.from(s).sort();
    };
    return {
      sizes: collect("sizes"),
      types: collect("types"),
      woods: collect("woods"),
      finishes: collect("finishes"),
    };
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      for (const k of Object.keys(selected) as FilterKey[]) {
        const sel = selected[k];
        if (sel.length && !sel.some((v) => (p[k] as string[]).includes(v))) return false;
      }
      if (priceBounds.max > 0 && p.price_value != null && p.price_value > activePriceMax) return false;
      return true;
    });
  }, [products, selected, activePriceMax, priceBounds.max]);

  const toggle = (k: FilterKey, v: string) => {
    setSelected((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  };
  const clearAll = () => {
    setSelected({ sizes: [], types: [], woods: [], finishes: [] });
    setPriceMax(null);
  };
  const activeCount =
    Object.values(selected).reduce((a, b) => a + b.length, 0) + (priceMax != null ? 1 : 0);

  type SortKey = "default" | "popularity" | "rating" | "newest" | "price_asc" | "price_desc";
  const SORT_LABELS: Record<SortKey, string> = {
    default: "Ordenação padrão",
    popularity: "Ordenar por popularidade",
    rating: "Ordenar por média de classificação",
    newest: "Ordenar por mais recente",
    price_asc: "Ordenar por preço: menor para maior",
    price_desc: "Ordenar por preço: maior para menor",
  };
  const [sort, setSort] = useState<SortKey>("default");
  const [perPage, setPerPage] = useState<number>(12);
  const [cols, setCols] = useState<2 | 3 | 4>(3);
  const [page, setPage] = useState(1);

  const priceOf = (p: Product): number => {
    if (p.price_value != null && !isNaN(p.price_value)) return p.price_value;
    const raw = (p.price ?? "").replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
    const n = parseFloat(raw);
    return isNaN(n) ? 0 : n;
  };

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "price_asc": arr.sort((a, b) => priceOf(a) - priceOf(b)); break;
      case "price_desc": arr.sort((a, b) => priceOf(b) - priceOf(a)); break;
      case "newest": arr.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")); break;
      case "popularity": arr.sort((a, b) => Number(b.most_viewed) - Number(a.most_viewed) || Number(b.featured) - Number(a.featured)); break;
      case "rating": arr.sort((a, b) => Number(b.featured) - Number(a.featured)); break;
      default: break;
    }
    return arr;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  const gridCols = cols === 2 ? "md:grid-cols-2" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-4";

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />

      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 text-xs text-neutral-600">
          <Link to="/" className="hover:text-[#A7144C]">Início</Link>
          <ChevronRight size={12} />
          <span className="text-neutral-900 font-medium">{category.name}</span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[260px_1fr] gap-8">
        <aside className="hidden md:block space-y-6">
          <div>
            <h3 className="font-bold text-sm mb-3 border-b-2 border-[#A7144C] pb-2 inline-block">CATEGORIAS</h3>
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
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <SlidersHorizontal size={14} /> FILTROS
              </h3>
              {activeCount > 0 && (
                <button onClick={clearAll} className="text-xs text-[#A7144C] hover:underline flex items-center gap-1">
                  <X size={12} /> Limpar
                </button>
              )}
            </div>

            {(Object.keys(FILTER_LABELS) as FilterKey[]).map((k) =>
              options[k].length > 0 ? (
                <div key={k} className="mb-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600 mb-2">{FILTER_LABELS[k]}</div>
                  <ul className="space-y-1.5">
                    {options[k].map((v) => {
                      const checked = selected[k].includes(v);
                      return (
                        <li key={v}>
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-[#A7144C]">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggle(k, v)}
                              className="accent-[#A7144C]"
                            />
                            {v}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null
            )}

            {priceBounds.max > 0 && (
              <div className="mb-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600 mb-2">
                  Faixa de preço
                </div>
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={activePriceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#A7144C]"
                />
                <div className="flex justify-between text-xs text-neutral-600 mt-1">
                  <span>R$ {priceBounds.min}</span>
                  <span className="font-semibold">até R$ {activePriceMax}</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-sm text-neutral-500 mt-1">{sorted.length} de {products.length} produto{products.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-neutral-200 py-3 mb-6 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-neutral-600">
                <span>Mostrar:</span>
                {[9, 12, 18, 24].map((n, i) => (
                  <span key={n} className="flex items-center gap-2">
                    <button
                      onClick={() => { setPerPage(n); setPage(1); }}
                      className={`hover:text-[#A7144C] ${perPage === n ? "font-bold text-neutral-900" : ""}`}
                    >
                      {n}
                    </button>
                    {i < 3 && <span className="text-neutral-300">/</span>}
                  </span>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-1 border-l border-neutral-200 pl-4">
                {[
                  { c: 2 as const, Icon: Grid2x2 },
                  { c: 3 as const, Icon: Grid3x3 },
                  { c: 4 as const, Icon: LayoutGrid },
                ].map(({ c, Icon }) => (
                  <button
                    key={c}
                    onClick={() => setCols(c)}
                    aria-label={`${c} colunas`}
                    className={`p-1.5 rounded hover:bg-neutral-100 ${cols === c ? "text-[#A7144C]" : "text-neutral-500"}`}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-neutral-300 rounded px-3 py-1.5 text-sm bg-white outline-none focus:border-[#A7144C]"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {sorted.length === 0 ? (
            <div className="border border-dashed border-neutral-300 rounded-lg p-12 text-center text-neutral-500">
              Nenhum produto encontrado com os filtros selecionados.
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-2 ${gridCols} gap-5`}>
                {paged.map((p) => (
                  <div
                    key={p.id}
                    className="group border border-neutral-200 rounded-lg overflow-hidden bg-white hover:shadow-lg hover:border-[#A7144C]/40 transition-all flex flex-col"
                  >
                    <Link to={productPath(p, categorias) as any} className="block">
                      <div className="relative aspect-square bg-neutral-50 overflow-hidden">
                        {p.main_image && (
                          <SupabaseImage src={p.main_image} alt={p.name} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                        )}
                        <span className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 grid place-items-center text-neutral-600 shadow">
                          <Heart size={16} />
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                          {p.old_price && <span className="text-xs text-neutral-400 line-through">{p.old_price}</span>}
                          <span className="font-bold text-[#A7144C]">
                            {formatPriceDisplay(p)}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="px-4 pb-4 mt-auto">
                      <Link to={productPath(p, categorias) as any} className="block w-full text-center bg-[#A7144C] hover:bg-[#8b1140] text-white text-xs font-semibold py-2.5 rounded-full">
                        SOLICITAR ORÇAMENTO
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded border border-neutral-200 disabled:opacity-40 hover:border-[#A7144C]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-9 h-9 rounded border text-sm ${
                        n === currentPage
                          ? "bg-[#A7144C] text-white border-[#A7144C]"
                          : "border-neutral-200 hover:border-[#A7144C]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded border border-neutral-200 disabled:opacity-40 hover:border-[#A7144C]"
                  >
                    <ChevRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <a href={whatsappHref} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#1eb659] text-white rounded-full w-14 h-14 grid place-items-center shadow-lg z-50" aria-label="WhatsApp">
        <MessageCircle size={26} />
      </a>
    </div>
  );
}
