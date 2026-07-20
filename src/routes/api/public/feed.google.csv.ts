import { createFileRoute } from "@tanstack/react-router";
import { escapeCsv, priceValue, siteOrigin, stripHtml } from "@/lib/feed-utils";

// Google Merchant Center CSV feed
// Docs: https://support.google.com/merchants/answer/7052112
export const Route = createFileRoute("/api/public/feed/google/csv")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const origin = siteOrigin(request);

        const [{ data: products }, { data: categories }, { data: settings }] = await Promise.all([
          supabaseAdmin.from("products").select("*").eq("active", true).order("sort_order"),
          supabaseAdmin.from("categories").select("id,name"),
          supabaseAdmin.from("site_settings").select("*"),
        ]);

        const catById = new Map((categories ?? []).map((c) => [c.id, c.name]));
        const siteMap: Record<string, any> = {};
        (settings ?? []).forEach((r: any) => (siteMap[r.key] = r.value));
        const brand = siteMap.site?.nome || "Loja";

        const headers = [
          "id",
          "title",
          "description",
          "link",
          "image_link",
          "additional_image_link",
          "availability",
          "price",
          "sale_price",
          "brand",
          "condition",
          "product_type",
          "identifier_exists",
        ];

        const lines: string[] = [headers.join("\t")];
        for (const p of products ?? []) {
          const price = priceValue(p as any);
          if (!price || !p.main_image) continue;
          const oldPrice = (p as any).old_price
            ? priceValue({ price: (p as any).old_price, price_value: null } as any)
            : null;
          const regular = oldPrice ?? price;
          const sale = oldPrice ? price : "";
          const gallery = ((p.gallery as string[] | null) ?? []).slice(0, 10).join(",");
          const desc = stripHtml((p as any).description) || p.name;
          lines.push(
            [
              p.id,
              p.name,
              desc,
              `${origin}/produto/${p.slug}`,
              p.main_image,
              gallery,
              "in stock",
              `${regular.toFixed(2)} BRL`,
              sale ? `${(sale as number).toFixed(2)} BRL` : "",
              brand,
              "new",
              p.category_id ? catById.get(p.category_id) ?? "" : "",
              "no",
            ]
              .map(escapeCsv)
              .join("\t"),
          );
        }

        return new Response(lines.join("\n"), {
          headers: {
            "Content-Type": "text/tab-separated-values; charset=utf-8",
            "Cache-Control": "public, max-age=1800",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
