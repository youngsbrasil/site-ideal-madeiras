import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { fetchProductBySlug, productPath, type Product } from "@/lib/site-data";
import { ProductView } from "@/components/ProductView";
import {
  productMetaTitle,
  productMetaDescription,
  absoluteUrl,
  productJsonLd,
  breadcrumbJsonLd,
  SITE_NAME,
} from "@/lib/seo";

export const Route = createFileRoute("/$")({
  loader: async ({ params }) => {
    const splat = (params as { _splat?: string })._splat ?? "";
    const segments = splat.split("/").map((s) => decodeURIComponent(s)).filter(Boolean);
    const slug = segments[segments.length - 1];
    if (!slug) throw notFound();
    const product = await fetchProductBySlug(slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Produto não encontrado - Ideal Madeiras" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    const title = productMetaTitle(p);
    const desc = productMetaDescription(p);
    const url = p.canonical || absoluteUrl(productPath(p));
    const img = p.og_image || p.main_image || undefined;
    const crumbs = breadcrumbJsonLd([
      { name: SITE_NAME, url: absoluteUrl("/") },
      { name: p.name, url },
    ]);
    const productLd = productJsonLd(p, url);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        ...(p.noindex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        ...(img ? [{ property: "og:image", content: img }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(productLd) },
        { type: "application/ld+json", children: JSON.stringify(crumbs) },
      ],
    };
  },
  component: SplatProductPage,
  notFoundComponent: SplatNotFound,
  errorComponent: SplatError,
});

function SplatProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  return <ProductView product={product} />;
}

function SplatNotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold text-[#A7144C]">Página não encontrada</h1>
        <p className="mt-2 text-neutral-600">O endereço acessado não existe.</p>
        <Link to="/" className="inline-block mt-6 bg-[#A7144C] text-white px-6 py-3 rounded-full font-semibold">Voltar à página inicial</Link>
      </div>
    </div>
  );
}

function SplatError() {
  return <div className="min-h-screen grid place-items-center p-8 text-center"><p>Ocorreu um erro ao carregar a página.</p></div>;
}
