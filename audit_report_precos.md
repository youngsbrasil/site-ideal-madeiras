# Relatório de Auditoria — Etapa 1 (Preço e Anúncios)

| arquivo | linha | trecho | tipo |
| :--- | :--- | :--- | :--- |
| `src/lib/site-data.ts` | 25 | `price: string;` | Leitura de campo legado |
| `src/lib/site-data.ts` | 26 | `old_price: string | null;` | Leitura de campo legado |
| `src/components/SiteHeader.tsx` | 148 | `{s.price ? `· ${s.price}` : ""}` | Renderização de preço (busca) |
| `src/components/SiteHeader.tsx` | 178 | `<span className="hidden md:inline text-sm font-semibold">R$ 0,00</span>` | Preço fixo "R$ 0,00" (carrinho) |
| `src/components/SiteHeader.tsx` | 40 | `settings?.topbar.texto || "FRETE GRÁTIS..."` | Topbar com fallback fixo |
| `src/components/ProductView.tsx` | 28 | `... (${product.price}).` | Preço no WhatsApp |
| `src/components/ProductView.tsx` | 68 | `{[...Array(5)].map(...)` | Bloco de estrelas fixo |
| `src/components/ProductView.tsx` | 69 | `(28 avaliações)` | Contador fixo |
| `src/components/ProductView.tsx` | 74 | `<span className="text-4xl font-bold text-[#A7144C]">{product.price}</span>` | Renderização de preço (PDP) |
| `src/components/ProductView.tsx` | 76 | `ou em até 12x sem juros no cartão` | Parcelamento fixo |
| `src/components/ProductView.tsx` | 97 | `Frete grátis acima de R$ 150` | Regra de frete hardcoded |
| `src/components/ProductView.tsx` | 98 | `Parcelamento em até 12x` | Texto de parcelamento fixo |
| `src/routes/index.tsx` | 108 | `settings?.site.whatsapp || "5511942000000"` | WhatsApp placeholder |
| `src/routes/index.tsx` | 109 | `settings?.site.telefone || "(11) 4200-0000"` | Telefone placeholder |
| `src/routes/index.tsx` | 127 | `10x PARCELAMENTO DIRETO` | Texto de parcelamento fixo (benefícios) |
| `src/routes/index.tsx` | 222 | `{oferta.price}` | Preço (carrossel home) |
| `src/routes/index.tsx` | 454 | `{p.price}` | Preço (ProductCard) |
| `src/routes/checkout.tsx` | 57 | `parsePriceBRL(i.price)` | Cálculo baseado em string |
| `src/routes/checkout.tsx` | 146 | `{previewProduct.price}` | Preço (Checkout) |
| `src/routes/categoria.$slug.tsx` | 145-146 | `price_asc: "...", price_desc: "..."` | Opções de ordenação de preço |
| `src/routes/categoria.$slug.tsx` | 143 | `rating: "Ordenar por média de classificação"` | Opção de ordenação por avaliação |
| `src/routes/categoria.$slug.tsx` | 153-158 | `priceOf` function | Lógica de parsing de preço legado |
| `src/routes/categoria.$slug.tsx` | 262-263 | `R$ {priceBounds.min}` | Renderização de "R$" no filtro |
| `src/lib/seo.ts` | 22 | `... por ${p.price}.` | Preço na Meta Description |
| `src/lib/seo.ts` | 58-65 | `offers: { ... }` | Bloco JSON-LD com parsing de preço |
| `src/lib/seo.ts` | 90 | `priceRange: "$$"` | Faixa de preço hardcoded |
| `src/lib/search.ts` | 42 | `.select("id,name,slug,main_image,price")` | Query de campo legado |
| `src/lib/feed-utils.ts` | 39-41 | `priceValue` function | Lógica de parsing legado nos feeds |
| `src/routes/__root.tsx` | 96 | `JSON.stringify(localBusinessJsonLd())` | JSON-LD montado no root |

A auditoria da Etapa 1 está concluída. Aguardando o "OK" para prosseguir com a aplicação das correções.
