# Auditoria de Dados Hardcoded e Prova Social

| arquivo | linha | trecho | tipo |
| :--- | :--- | :--- | :--- |
| `src/routes/index.tsx` | 108 | `const whatsapp = settings?.site.whatsapp \|\| "5511942000000";` | WhatsApp placeholder |
| `src/routes/index.tsx` | 109 | `const telefone = settings?.site.telefone \|\| "(11) 4200-0000";` | Telefone placeholder |
| `src/routes/index.tsx` | 361 | `{ l: "LOJA 1", e: "Rua do Gasômetro, 350 - Brás - SP", t: "(11) 99400-0507" }` | Telefone Loja 1 hardcoded |
| `src/routes/index.tsx` | 362 | `{ l: "LOJA 2", e: "Rua do Gasômetro, 284 - Brás - SP", t: "(11) 3326-3197" }` | Telefone Loja 2 hardcoded |
| `src/routes/index.tsx` | 363 | `{ l: "LOJA 3", e: "Rua do Gasômetro, 306 - Brás - SP", t: "(11) 98801-3370" }` | Telefone Loja 3 hardcoded |
| `src/routes/index.tsx` | 435 | `const whatsapp = (settings?.site.whatsapp \|\| "5511942000000").replace(/\D/g, "");` | WhatsApp placeholder |
| `src/routes/index.tsx` | 561 | `<div className="text-xs text-neutral-500">Com base em <b>84 avaliações</b></div>` | String "84 avaliações" |
| `src/routes/checkout.tsx` | 54 | `const whatsapp = (settings?.site.whatsapp \|\| "5511942000000").replace(/\D/g, "");` | WhatsApp placeholder |
| `src/lib/products.ts` | 146 | `export const WHATSAPP_NUMBER = "5511942000000";` | WhatsApp placeholder |
| `src/routes/categoria.$slug.tsx` | 90 | `const whatsapp = (settings?.site.whatsapp \|\| "5511942000000").replace(/\D/g, "");` | WhatsApp placeholder |
| `src/components/SiteHeader.tsx` | 40 | `const topbarText = settings?.topbar.texto \|\| "FRETE GRÁTIS PARA TODOS OS PEDIDOS ACIMA DE R$ 150";` | String "FRETE GRÁTIS" / "R$ 150" |
| `src/components/SiteHeader.tsx` | 41 | `const telefone = settings?.site.telefone \|\| "(11) 4200-0000";` | Telefone placeholder |
| `src/components/ProductView.tsx` | 26 | `const whatsapp = (settings?.site.whatsapp \|\| "5511942000000").replace(/\D/g, "");` | WhatsApp placeholder |
| `src/components/ProductView.tsx` | 27 | `const telefone = settings?.site.telefone \|\| "(11) 4200-0000";` | Telefone placeholder |
| `src/components/ProductView.tsx` | 68 | `{[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}` | Estrelas fixas (array literal) |
| `src/components/ProductView.tsx` | 69 | `<span className="text-xs text-neutral-500">(28 avaliações)</span>` | String "28 avaliações" |
| `src/components/ProductView.tsx` | 97 | `<span>Frete grátis acima de R$ 150</span>` | String "R$ 150" |
| `src/routes/index.tsx` | 446 | `{[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" className="text-yellow-400" />)}` | Estrelas fixas no ProductCard |
| `src/routes/index.tsx` | 447 | `<span className="text-[10px] text-neutral-500">(28)</span>` | Contador fixo no ProductCard |
| `src/lib/seo.ts` | 82-128 | `localBusinessJsonLd` | JSON-LD hardcoded |
