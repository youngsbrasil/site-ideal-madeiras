// Shared helpers for product feed generation (Meta / Google Shopping / etc.)

export function escapeXml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function escapeCsv(v: any): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function stripHtml(s: string | null | undefined): string {
  return String(s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Parse Brazilian-formatted price string ("R$ 1.250,00") to number
export function parsePriceBR(v: string | null | undefined): number | null {
  if (!v) return null;
  const clean = String(v).replace(/[^\d,.\-]/g, "");
  if (!clean) return null;
  let num: number;
  if (clean.includes(",") && clean.lastIndexOf(",") > clean.lastIndexOf(".")) {
    num = parseFloat(clean.replace(/\./g, "").replace(",", "."));
  } else {
    num = parseFloat(clean.replace(/,/g, ""));
  }
  return isNaN(num) ? null : num;
}

export function priceValue(p: { price_value: number | null; price: string }): number | null {
  return p.price_value ?? parsePriceBR(p.price);
}

export function siteOrigin(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}
