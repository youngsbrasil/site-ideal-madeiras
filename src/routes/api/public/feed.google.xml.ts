import { createFileRoute } from "@tanstack/react-router";
import { escapeXml, priceValue, siteOrigin, stripHtml } from "@/lib/feed-utils";

export const Route = createFileRoute("/api/public/feed/google.xml")({
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
        const siteName = siteMap.site?.nome || "Loja";

        const items = (products ?? [])
          .map((p: any) => {
            const price = priceValue(p);
            if (!price || !p.main_image) return "";
            const link = `${origin}/produto/${p.slug}`;
            const cat = p.category_id ? catById.get(p.category_id) ?? "" : "";
            const desc = stripHtml(p.description) || p.name;
            return `
    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(p.main_image)}</g:image_link>
      ${(p.gallery ?? [])
        .slice(0, 10)
        .map((g: string) => `<g:additional_image_link>${escapeXml(g)}</g:additional_image_link>`)
        .join("\n      ")}
      <g:availability>in stock</g:availability>
      <g:condition>new</g:condition>
      <g:price>${price.toFixed(2)} BRL</g:price>
      <g:brand>${escapeXml(siteName)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      ${cat ? `<g:product_type>${escapeXml(cat)}</g:product_type>` : ""}
    </item>`;
          })
          .filter(Boolean)
          .join("");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${escapeXml(origin)}</link>
    <description>Feed de produtos - ${escapeXml(siteName)}</description>${items}
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=1800",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
