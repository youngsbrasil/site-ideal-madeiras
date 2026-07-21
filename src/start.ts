import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

/** 301/302 redirect middleware backed by the `redirects` table. */
const redirectsMiddleware = createMiddleware().server(async ({ request, next }) => {
  try {
    // Only GET/HEAD on page-like paths; skip assets/api/build outputs.
    if (request.method !== "GET" && request.method !== "HEAD") return next();
    const url = new URL(request.url);
    const p = url.pathname;
    if (
      p.startsWith("/api/") ||
      p.startsWith("/_build/") ||
      p.startsWith("/assets/") ||
      p.startsWith("/@") ||
      p.startsWith("/node_modules/") ||
      /\.[a-z0-9]{2,5}$/i.test(p)
    ) {
      return next();
    }
    const { findRedirect, bumpHit } = await import("./lib/redirects.server");
    const hit = await findRedirect(p);
    if (hit) {
      bumpHit(hit.url_origem);
      const dest = /^https?:\/\//i.test(hit.url_destino)
        ? hit.url_destino
        : hit.url_destino + (url.search || "");
      return new Response(null, {
        status: hit.tipo === 302 ? 302 : 301,
        headers: { Location: dest, "Cache-Control": "no-cache" },
      });
    }
  } catch (e) {
    console.error("[redirects middleware]", e);
  }
  return next();
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [redirectsMiddleware, errorMiddleware],
}));
