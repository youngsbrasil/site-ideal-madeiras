// Central SEO helpers: canonical URL builder, fallback titles, JSON-LD generators.
import type { Product, Category } from "@/lib/site-data";

export const SITE_URL = "https://start-your-journey-34.lovable.app";
export const SITE_NAME = "Lojas Ideal Madeiras";
export const BRAND_NAME = "Ideal Madeiras";

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}

export function productMetaTitle(p: Product): string {
  return p.meta_title?.trim() || `${p.name} | ${BRAND_NAME}`;
}

export function productMetaDescription(p: Product): string {
  if (p.meta_description?.trim()) return p.meta_description.trim();
  const desc = (p.description ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (desc) return desc.slice(0, 160);
  return `${p.name} — Ideal Madeiras. Compre com garantia e envio para todo o Brasil.`;
}

export function categoryMetaTitle(c: Category): string {
  return c.meta_title?.trim() || `${c.name} | ${BRAND_NAME}`;
}

export function categoryMetaDescription(c: Category): string {
  return (
    c.meta_description?.trim() ||
    `Confira nossa seleção de ${c.name.toLowerCase()} na ${SITE_NAME}. Qualidade, preço justo e entrega para todo o Brasil.`
  );
}

/** Product JSON-LD (schema.org/Product) */
export function productJsonLd(p: Product, canonicalUrl: string) {
  const priceNum =
    p.price_value ??
    (() => {
      const clean = String(p.price ?? "").replace(/[^\d,.\-]/g, "");
      if (!clean) return null;
      const n =
        clean.includes(",") && clean.lastIndexOf(",") > clean.lastIndexOf(".")
          ? parseFloat(clean.replace(/\./g, "").replace(",", "."))
          : parseFloat(clean.replace(/,/g, ""));
      return isNaN(n) ? null : n;
    })();

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: p.name,
    image: [p.og_image || p.main_image || "", ...(p.gallery ?? [])].filter(Boolean),
    description: productMetaDescription(p),
    sku: p.slug,
    brand: { "@type": "Brand", name: BRAND_NAME },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "BRL",
      price: priceNum ?? undefined,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** LocalBusiness — 3 lojas Ideal Madeiras na Rua do Gasômetro, Brás/SP */
export function localBusinessJsonLd(settings?: any) {
  const lojas = settings?.lojas || [];
  const cnpj = settings?.site?.cnpj;
  const logo = "https://idealmadeiras.com.br/wp-content/uploads/2024/09/logo-ideal-madeiras.png";

  if (!lojas || lojas.length === 0) return null;


  return lojas.map((loja: any) => {
    const telephone = loja.telefone ? `+55${loja.telefone.replace(/\D/g, "")}` : undefined;
    
    const schema: any = {
      "@context": "https://schema.org",
      "@type": "HomeGoodsStore",
      "name": `Lojas Ideal Madeiras — ${loja.nome}`,
      "image": logo,
      "url": SITE_URL,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": loja.logradouro,
        "addressLocality": loja.cidade,
        "addressRegion": loja.uf,
        "addressCountry": "BR"
      },
      "@id": `${SITE_URL}#${loja.nome.toLowerCase().replace(/\s+/g, "-")}`
    };

    if (telephone) schema.telephone = telephone;
    if (cnpj) schema.vatID = cnpj;

    return schema;
  });
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: "https://idealmadeiras.com.br/wp-content/uploads/2024/09/logo-ideal-madeiras.png",
  };
}
