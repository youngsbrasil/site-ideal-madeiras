import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { fetchProductBySlug, type Product } from "@/lib/site-data";
import { ProductView } from "@/components/ProductView";

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
    const title = `${p.name} - Lojas Ideal Madeiras`;
    const desc = `${p.name} por ${p.price}. Compre com segurança na Lojas Ideal Madeiras.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        ...(p.main_image ? [{ property: "og:image", content: p.main_image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
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
