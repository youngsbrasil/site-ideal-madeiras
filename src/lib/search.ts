import { supabase } from "@/integrations/supabase/client";

export function normalizeTerm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Distância de Levenshtein (para sugestão "você quis dizer")
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : Math.min(prev, dp[j], dp[j - 1]) + 1;
      prev = tmp;
    }
  }
  return dp[b.length];
}

export type Suggestion =
  | { kind: "product"; id: string; name: string; slug: string; image: string | null; price: string | null }
  | { kind: "category"; id: string; name: string; slug: string };

export async function fetchSuggestions(term: string, limit = 8): Promise<Suggestion[]> {
  const t = term.trim();
  if (t.length < 2) return [];
  const like = `%${t}%`;

  const [prod, cat] = await Promise.all([
    supabase
      .from("products")
      .select("id,name,slug,main_image,price")
      .eq("active", true)
      .ilike("name", like)
      .limit(limit),
    supabase.from("categories").select("id,name,slug").ilike("name", like).limit(4),
  ]);

  const products: Suggestion[] = (prod.data ?? []).map((p: any) => ({
    kind: "product",
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.main_image ?? null,
    price: p.price ?? null,
  }));
  const categories: Suggestion[] = (cat.data ?? []).map((c: any) => ({
    kind: "category",
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));
  return [...categories, ...products];
}

// "Você quis dizer" — busca termo mais próximo no catálogo
export async function fetchDidYouMean(term: string): Promise<string | null> {
  const t = normalizeTerm(term);
  if (t.length < 3) return null;
  const { data } = await supabase.from("products").select("name").eq("active", true).limit(500);
  if (!data) return null;
  let best: { name: string; dist: number } | null = null;
  for (const row of data as { name: string }[]) {
    const words = row.name.split(/\s+/);
    for (const w of words) {
      const nw = normalizeTerm(w);
      if (nw.length < 3) continue;
      const d = levenshtein(t, nw);
      if (d > 0 && d <= 2 && (!best || d < best.dist)) best = { name: w, dist: d };
    }
  }
  return best?.name ?? null;
}

export async function logSearch(term: string, resultsCount: number, clickedProductId?: string) {
  const t = term.trim();
  if (!t) return;
  try {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("search_log").insert({
      term: t,
      term_normalized: normalizeTerm(t),
      results_count: resultsCount,
      clicked_product_id: clickedProductId ?? null,
      user_id: userData.user?.id ?? null,
    } as any);
  } catch {
    // silencioso — telemetria não deve quebrar UX
  }
}
