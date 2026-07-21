import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/seo";

async function loadCatalog() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const supa = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const [cats, prods] = await Promise.all([
    supa.from("categories").select("slug,parent_id,id,updated_at,noindex").order("sort_order"),
    supa
      .from("products")
      .select("slug,category_id,updated_at,noindex,active")
      .eq("active", true)
      .order("sort_order"),
  ]);
  return {
    categories: (cats.data ?? []) as any[],
    products: (prods.data ?? []) as any[],
  };
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { categories, products } = await loadCatalog();
        const catById = new Map(categories.map((c) => [c.id, c]));

        const entries: { loc: string; lastmod?: string; priority?: string }[] = [
          { loc: `${SITE_URL}/`, priority: "1.0" },
        ];

        for (const c of categories) {
          if (c.noindex) continue;
          const parent = c.parent_id ? catById.get(c.parent_id) : null;
          const parts = parent ? [parent.slug, c.slug] : [c.slug];
          entries.push({
            loc: `${SITE_URL}/${parts.map(encodeURIComponent).join("/")}`,
            lastmod: c.updated_at,
            priority: "0.8",
          });
        }

        for (const p of products) {
          if (p.noindex) continue;
          const cat = p.category_id ? catById.get(p.category_id) : null;
          const parent = cat?.parent_id ? catById.get(cat.parent_id) : null;
          const parts = cat
            ? parent
              ? [parent.slug, cat.slug, p.slug]
              : [cat.slug, p.slug]
            : [p.slug];
          entries.push({
            loc: `${SITE_URL}/${parts.map(encodeURIComponent).join("/")}`,
            lastmod: p.updated_at,
            priority: "0.7",
          });
        }

        const urls = entries
          .map(
            (e) =>
              `  <url>\n    <loc>${e.loc}</loc>${
                e.lastmod ? `\n    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : ""
              }${e.priority ? `\n    <priority>${e.priority}</priority>` : ""}\n  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=1800",
          },
        });
      },
    },
  },
});
