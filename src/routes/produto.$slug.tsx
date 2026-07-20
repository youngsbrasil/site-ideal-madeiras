import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { fetchCategories, fetchProductBySlug, productPath } from "@/lib/site-data";

export const Route = createFileRoute("/produto/$slug")({
  loader: async ({ params }) => {
    const product = await fetchProductBySlug(params.slug);
    if (!product) throw notFound();
    const categories = await fetchCategories();
    throw redirect({ to: productPath(product, categories) as never, replace: true });
  },
  component: () => null,
});
