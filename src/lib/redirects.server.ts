// Server-only redirect lookup. Cached in-memory to avoid DB hit per request.
import { createClient } from "@supabase/supabase-js";

type Row = { url_origem: string; url_destino: string; tipo: number };

let cache: { at: number; rows: Row[] } | null = null;
const TTL_MS = 60_000;

function normalize(p: string): string {
  if (!p) return "/";
  const q = p.split("?")[0].split("#")[0];
  // trim trailing slash (except root)
  return q.length > 1 && q.endsWith("/") ? q.slice(0, -1) : q;
}

async function loadRedirects(): Promise<Row[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return cache?.rows ?? [];
  const client = createClient(url, key, {
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
  const { data, error } = await client
    .from("redirects")
    .select("url_origem,url_destino,tipo")
    .eq("ativo", true);
  if (error) {
    console.error("[redirects] load error:", error.message);
    return cache?.rows ?? [];
  }
  cache = { at: Date.now(), rows: (data ?? []) as Row[] };
  return cache.rows;
}

export async function findRedirect(pathname: string): Promise<Row | null> {
  const rows = await loadRedirects();
  const target = normalize(pathname);
  return (
    rows.find((r) => normalize(r.url_origem) === target) ??
    null
  );
}

/** Fire-and-forget hit counter increment (non-blocking). */
export function bumpHit(url_origem: string): void {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  // service role update bypasses RLS
  fetch(`${url}/rest/v1/rpc/`, {}).catch(() => {}); // noop keep-alive
  try {
    const admin = createClient(url, key, { auth: { persistSession: false } });
    admin
      .from("redirects")
      // @ts-expect-error – increment via raw expression is unsupported by builder; do a select+update fallback
      .update({ hits: undefined })
      .eq("url_origem", url_origem)
      .then(() => {});
  } catch {
    /* ignore */
  }
  // simple non-atomic counter increment
  try {
    const admin = createClient(url, key, { auth: { persistSession: false } });
    admin
      .from("redirects")
      .select("id,hits")
      .eq("url_origem", url_origem)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        admin.from("redirects").update({ hits: (data.hits ?? 0) + 1 }).eq("id", data.id).then(() => {});
      });
  } catch {
    /* ignore */
  }
}
