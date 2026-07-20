import { createFileRoute } from "@tanstack/react-router";
import { escapeCsv, priceValue, siteOrigin, stripHtml } from "@/lib/feed-utils";

// Meta (Facebook / Instagram) Commerce catalog CSV
// Docs: https://www.facebook.com/business/help/120325381656392
export const Route = createFileRoute("/api/public/feed/meta/csv")({
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
          "availability",
          "condition",
          "price",
          "link",
          "image_link",
          "additional_image_link",
          "brand",
          "product_type",
          "google_product_category",
          "sale_price",
        ];

        const lines: string[] = [headers.join(",")];
        for (const p of products ?? []) {
          const price = priceValue(p as any);
          if (!price || !p.main_image) continue;
          const oldPrice = (p as any).old_price ? priceValue({ price: (p as any).old_price, price_value: null } as any) : null;
          // If old_price exists it's the "regular" price; current price becomes sale price
          const regular = oldPrice ?? price;
          const sale = oldPrice ? price : "";
          const link = `${origin}/produto/${p.slug}`;
          const cat = p.category_id ? catById.get(p.category_id) ?? "" : "";
          const gallery = (p.gallery ?? []).slice(0, 10).join(",");
          const desc = stripHtml((p as any).description) || p.name;
          lines.push(
            [
              p.id,
              p.name,
              desc,
              "in stock",
              "new",
              `${regular.toFixed(2)} BRL`,
              link,
              p.main_image,
              gallery,
              brand,
              cat,
              "",
              sale ? `${(sale as number).toFixed(2)} BRL` : "",
            ]
              .map(escapeCsv)
              .join(","),
          );
        }

        return new Response(lines.join("\n"), {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Cache-Control": "public, max-age=1800",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
