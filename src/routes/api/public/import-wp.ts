import { createFileRoute } from "@tanstack/react-router";
import { readFile } from "node:fs/promises";
import path from "node:path";

// One-shot importer: wipes products & categories, then imports from data/wp-import.json.
// Guarded by IMPORT_TOKEN. Delete this file after use.
export const Route = createFileRoute("/api/public/import-wp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-import-token");
        if (!token || token !== "wp-import-2026-oneshot") {
          return new Response("forbidden", { status: 403 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const filePath = path.join(process.cwd(), "data", "wp-import.json");
        const raw = await readFile(filePath, "utf8");
        const { categories, products } = JSON.parse(raw) as {
          categories: { slug: string; name: string; parent_slug: string | null }[];
          products: any[];
        };

        // Wipe
        await supabaseAdmin.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabaseAdmin.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

        // Insert categories (no parent yet)
        const catRows = categories.map((c, i) => ({
          slug: c.slug, name: c.name, sort_order: i, product_count: 0,
        }));
        const { error: e1 } = await supabaseAdmin.from("categories").insert(catRows);
        if (e1) return new Response("cat insert: " + e1.message, { status: 500 });

        // Fetch ids
        const { data: cats } = await supabaseAdmin.from("categories").select("id,slug");
        const slugToId = new Map((cats ?? []).map((c: any) => [c.slug, c.id]));

        // Set parents
        for (const c of categories) {
          if (c.parent_slug && slugToId.has(c.parent_slug)) {
            await supabaseAdmin.from("categories").update({ parent_id: slugToId.get(c.parent_slug) }).eq("slug", c.slug);
          }
        }

        // Insert products in batches
        const prodRows = products.map((p, i) => ({
          slug: p.slug,
          name: p.name,
          price: p.price ?? "",
          old_price: p.old_price ?? null,
          category_id: p.category_slug ? slugToId.get(p.category_slug) ?? null : null,
          main_image: p.main_image ?? "",
          gallery: p.gallery ?? [],
          description: p.description ?? "",
          price_value: p.price_value ?? null,
          active: true,
          sort_order: i,
        }));
        const BATCH = 50;
        for (let i = 0; i < prodRows.length; i += BATCH) {
          const chunk = prodRows.slice(i, i + BATCH);
          const { error } = await supabaseAdmin.from("products").insert(chunk);
          if (error) return new Response(`product insert @${i}: ${error.message}`, { status: 500 });
        }

        // Update product_count
        for (const [slug, id] of slugToId) {
          const { count } = await supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("category_id", id);
          await supabaseAdmin.from("categories").update({ product_count: count ?? 0 }).eq("id", id);
        }

        return new Response(JSON.stringify({ ok: true, categories: catRows.length, products: prodRows.length }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
