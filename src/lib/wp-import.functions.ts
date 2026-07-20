import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
// @ts-ignore - JSON bundled at build time
import wpData from "./wp-products.json";

type P = {
  slug: string;
  name: string;
  price: string;
  old_price: string | null;
  category_slug: string | null;
  main_image: string;
  gallery: string[];
  description: string;
  price_value: number | null;
};

export const runWpImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { products } = wpData as { products: P[] };

    // Wipe existing products
    const { error: dErr } = await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (dErr) throw new Error("delete: " + dErr.message);

    // Fetch category slug -> id
    const { data: cats, error: cErr } = await supabase.from("categories").select("id,slug");
    if (cErr) throw new Error("cats: " + cErr.message);
    const slugToId = new Map((cats ?? []).map((c: any) => [c.slug, c.id as string]));

    const rows = products.map((p, i) => ({
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

    const BATCH = 40;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += BATCH) {
      const chunk = rows.slice(i, i + BATCH);
      const { error } = await supabase.from("products").insert(chunk);
      if (error) throw new Error(`insert@${i}: ${error.message}`);
      inserted += chunk.length;
    }

    // update product_count per category
    for (const [, id] of slugToId) {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("category_id", id);
      await supabase.from("categories").update({ product_count: count ?? 0 }).eq("id", id);
    }

    return { ok: true, inserted, categories: slugToId.size };
  });
