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
  return `${p.name} por ${p.price}. Compre na ${SITE_NAME} com garantia e envio para todo o Brasil.`;
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
export function localBusinessJsonLd() {
  const base = {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    name: SITE_NAME,
    image: `${SITE_URL}/favicon.ico`,
    url: SITE_URL,
    priceRange: "$$",
  };
  return [
    {
      ...base,
      "@id": `${SITE_URL}#loja-1`,
      name: `${SITE_NAME} - Loja 1`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rua do Gasômetro",
        addressLocality: "São Paulo",
        addressRegion: "SP",
        addressCountry: "BR",
      },
    },
    {
      ...base,
      "@id": `${SITE_URL}#loja-2`,
      name: `${SITE_NAME} - Loja 2`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rua do Gasômetro",
        addressLocality: "São Paulo",
        addressRegion: "SP",
        addressCountry: "BR",
      },
    },
    {
      ...base,
      "@id": `${SITE_URL}#loja-3`,
      name: `${SITE_NAME} - Loja 3`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rua do Gasômetro",
        addressLocality: "São Paulo",
        addressRegion: "SP",
        addressCountry: "BR",
      },
    },
  ];
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
