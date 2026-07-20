import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { FileCode, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { slugify, type Product, type Category } from "@/lib/site-data";
import { useQueryClient } from "@tanstack/react-query";

// ---------- helpers ----------
const esc = (s: any) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const tag = (name: string, value: any) =>
  value === null || value === undefined || value === "" ? `<${name}/>` : `<${name}>${esc(value)}</${name}>`;

const cdata = (name: string, value: any) => {
  const v = value ?? "";
  if (v === "") return `<${name}/>`;
  return `<${name}><![CDATA[${String(v).replace(/]]>/g, "]]]]><![CDATA[>")}]]></${name}>`;
};

const listTag = (wrap: string, item: string, arr?: string[] | null) => {
  if (!arr || !arr.length) return `<${wrap}/>`;
  return `<${wrap}>${arr.map((v) => `<${item}>${esc(v)}</${item}>`).join("")}</${wrap}>`;
};

const text = (el: Element | null | undefined) => (el?.textContent ?? "").trim();
const childText = (parent: Element, name: string) => text(parent.getElementsByTagName(name)[0]);
const childList = (parent: Element, wrap: string, item: string): string[] => {
  const w = parent.getElementsByTagName(wrap)[0];
  if (!w) return [];
  return Array.from(w.getElementsByTagName(item)).map((n) => text(n)).filter(Boolean);
};

const download = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ---------- component ----------
type Parsed = {
  categories: Array<Partial<Category> & { name: string; slug: string }>;
  products: Array<any>;
};

export function ProductXmlImportExport({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Parsed | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; errors: string[] } | null>(null);

  // ---------- export ----------
  const buildXml = () => {
    const catBySlug = new Map(categories.map((c) => [c.id, c.slug]));

    const catsXml = categories
      .map(
        (c) => `
    <category>
      ${tag("slug", c.slug)}
      ${cdata("name", c.name)}
      ${tag("image_url", c.image_url ?? "")}
      ${tag("sort_order", c.sort_order ?? 0)}
    </category>`,
      )
      .join("");

    const prodsXml = products
      .map((p) => {
        const catSlug = p.category_id ? catBySlug.get(p.category_id) ?? "" : "";
        const specs = (p.specifications ?? [])
          .map(
            (s) =>
              `<spec>${cdata("label", s.label)}${cdata("valor", s.valor)}</spec>`,
          )
          .join("");
        return `
    <product>
      ${tag("slug", p.slug)}
      ${cdata("name", p.name)}
      ${tag("price", p.price)}
      ${tag("old_price", p.old_price ?? "")}
      ${tag("price_value", p.price_value ?? "")}
      ${tag("category_slug", catSlug)}
      ${tag("main_image", p.main_image ?? "")}
      ${listTag("gallery", "image", p.gallery)}
      ${cdata("description", p.description ?? "")}
      <specifications>${specs}</specifications>
      ${listTag("sizes", "item", p.sizes)}
      ${listTag("types", "item", p.types)}
      ${listTag("woods", "item", p.woods)}
      ${listTag("finishes", "item", p.finishes)}
      ${tag("featured", p.featured ? 1 : 0)}
      ${tag("most_viewed", p.most_viewed ? 1 : 0)}
      ${tag("active", p.active ? 1 : 0)}
      ${tag("sort_order", p.sort_order ?? 0)}
    </product>`;
      })
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<catalog exported_at="${new Date().toISOString()}">
  <categories>${catsXml}
  </categories>
  <products>${prodsXml}
  </products>
</catalog>`;
  };

  const exportXml = () => {
    download(buildXml(), "catalogo.xml");
  };

  // ---------- import ----------
  // Get elements by local name, ignoring XML namespaces (handles g:title etc.)
  const byLocal = (root: Element | Document, local: string): Element[] => {
    const ns = (root as Document).getElementsByTagNameNS
      ? (root as Document).getElementsByTagNameNS("*", local)
      : null;
    if (ns && ns.length) return Array.from(ns) as Element[];
    // Fallback: match any prefix
    return Array.from((root as Element).getElementsByTagName("*")).filter(
      (el) => el.localName === local || el.nodeName === local || el.nodeName.endsWith(":" + local),
    );
  };
  const firstText = (root: Element, local: string): string => {
    const els = byLocal(root, local);
    return els.length ? (els[0].textContent ?? "").trim() : "";
  };
  const allText = (root: Element, local: string): string[] =>
    byLocal(root, local).map((e) => (e.textContent ?? "").trim()).filter(Boolean);

  const parseBrPrice = (s: string): { text: string; value: number | null } => {
    if (!s) return { text: "", value: null };
    const clean = s.replace(/[^\d,.\-]/g, "");
    let num: number;
    if (clean.includes(",") && clean.lastIndexOf(",") > clean.lastIndexOf(".")) {
      num = parseFloat(clean.replace(/\./g, "").replace(",", "."));
    } else {
      num = parseFloat(clean.replace(/,/g, ""));
    }
    if (isNaN(num)) return { text: s, value: null };
    const text = `R$ ${num.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    return { text, value: num };
  };

  const slugFromUrl = (url: string): string => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/").filter(Boolean);
      return parts[parts.length - 1] ?? "";
    } catch {
      return "";
    }
  };

  const parseXml = (xmlText: string): Parsed => {
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    const err = doc.getElementsByTagName("parsererror")[0];
    if (err) throw new Error("XML inválido: " + err.textContent);

    // ---- Format A: our own <catalog> ----
    const nativeCats = Array.from(doc.getElementsByTagName("category"));
    const nativeProds = Array.from(doc.getElementsByTagName("product"));
    if (nativeCats.length || nativeProds.length) {
      const cats: Parsed["categories"] = nativeCats.map((c) => {
        const name = childText(c, "name");
        const slugRaw = childText(c, "slug");
        return {
          name,
          slug: slugRaw ? slugify(slugRaw) : slugify(name),
          image_url: childText(c, "image_url") || null,
          sort_order: Number(childText(c, "sort_order")) || 0,
        };
      }).filter((c) => c.name);

      const prods = nativeProds.map((p) => {
        const name = childText(p, "name");
        const slugRaw = childText(p, "slug");
        const priceValueStr = childText(p, "price_value");
        const priceValue = priceValueStr ? Number(priceValueStr) : null;
        const specsWrap = p.getElementsByTagName("specifications")[0];
        const specs = specsWrap
          ? Array.from(specsWrap.getElementsByTagName("spec")).map((s) => ({
              label: childText(s, "label"),
              valor: childText(s, "valor"),
            }))
          : [];
        return {
          name,
          slug: slugRaw ? slugify(slugRaw) : slugify(name),
          price: childText(p, "price"),
          old_price: childText(p, "old_price") || null,
          price_value: isNaN(priceValue as number) ? null : priceValue,
          category_slug: childText(p, "category_slug"),
          main_image: childText(p, "main_image") || null,
          gallery: childList(p, "gallery", "image"),
          description: childText(p, "description"),
          specifications: specs,
          sizes: childList(p, "sizes", "item"),
          types: childList(p, "types", "item"),
          woods: childList(p, "woods", "item"),
          finishes: childList(p, "finishes", "item"),
          featured: ["1", "true"].includes(childText(p, "featured").toLowerCase()),
          most_viewed: ["1", "true"].includes(childText(p, "most_viewed").toLowerCase()),
          active: childText(p, "active") === "" ? true : ["1", "true"].includes(childText(p, "active").toLowerCase()),
          sort_order: Number(childText(p, "sort_order")) || 0,
        };
      }).filter((p) => p.name);

      return { categories: cats, products: prods };
    }

    // ---- Format B: Google Shopping RSS / WebToffee feed ----
    const items = doc.getElementsByTagName("item");
    if (items.length) {
      const catMap = new Map<string, { name: string; slug: string; image_url: string | null; sort_order: number }>();
      const prods: any[] = [];

      Array.from(items).forEach((it) => {
        const title = firstText(it, "title");
        if (!title) return;
        const link = firstText(it, "link");
        const slug = slugify(slugFromUrl(link) || title);

        // category = leaf of product_type "PORTAS > Pivotante"
        const rawType = firstText(it, "product_type");
        const leaf = rawType.split(">").pop()?.trim() ?? "";
        let categorySlug = "";
        if (leaf) {
          categorySlug = slugify(leaf);
          if (!catMap.has(categorySlug)) {
            catMap.set(categorySlug, { name: leaf, slug: categorySlug, image_url: null, sort_order: 0 });
          }
        }

        const priceRaw = firstText(it, "price") || firstText(it, "sale_price");
        const salePriceRaw = firstText(it, "sale_price");
        const price = parseBrPrice(priceRaw);
        const oldPrice = salePriceRaw && priceRaw !== salePriceRaw ? parseBrPrice(priceRaw) : { text: "", value: null };

        const mainImg = firstText(it, "image_link") || null;
        const gallery = allText(it, "additional_image_link").filter((u) => u && u !== mainImg);

        const availability = firstText(it, "availability").toLowerCase();
        const active = availability === "" || availability.includes("stock");

        prods.push({
          name: title,
          slug,
          price: price.text || priceRaw,
          old_price: oldPrice.text || null,
          price_value: price.value,
          category_slug: categorySlug,
          main_image: mainImg,
          gallery,
          description: firstText(it, "description"),
          specifications: [],
          sizes: [],
          types: [],
          woods: [],
          finishes: [],
          featured: false,
          most_viewed: false,
          active,
          sort_order: 0,
        });
      });

      return { categories: Array.from(catMap.values()), products: prods };
    }

    return { categories: [], products: [] };
  };



  const onFile = async (f: File) => {
    try {
      const txt = await f.text();
      const parsed = parseXml(txt);
      if (!parsed.categories.length && !parsed.products.length) {
        alert("Nenhuma categoria ou produto encontrado no XML.");
        return;
      }
      setPreview(parsed);
    } catch (e: any) {
      alert("Erro ao ler XML: " + e.message);
    }
  };

  const runImport = async () => {
    if (!preview) return;
    setImporting(true);
    const errors: string[] = [];
    const total = preview.categories.length + preview.products.length;
    setProgress({ done: 0, total, errors: [] });
    let done = 0;

    // 1) upsert categories first (so products can link by slug)
    for (const c of preview.categories) {
      const { error } = await supabase.from("categories").upsert(
        { name: c.name, slug: c.slug, image_url: c.image_url, sort_order: c.sort_order },
        { onConflict: "slug" },
      );
      if (error) errors.push(`Categoria "${c.name}": ${error.message}`);
      done++;
      setProgress({ done, total, errors: [...errors] });
    }

    // 2) refresh category map (existing + newly created)
    const { data: allCats } = await supabase.from("categories").select("id,slug");
    const catIdBySlug = new Map((allCats ?? []).map((c: any) => [c.slug, c.id]));

    // 3) upsert products
    for (const p of preview.products) {
      const category_id = p.category_slug ? catIdBySlug.get(p.category_slug) ?? null : null;
      const { category_slug, ...rest } = p;
      const payload = { ...rest, category_id };
      const { error } = await supabase.from("products").upsert(payload, { onConflict: "slug" });
      if (error) errors.push(`Produto "${p.name}": ${error.message}`);
      done++;
      setProgress({ done, total, errors: [...errors] });
    }

    setImporting(false);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
    if (!errors.length) {
      alert(`Importação concluída: ${preview.categories.length} categorias e ${preview.products.length} produtos.`);
      setPreview(null);
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".xml,text/xml,application/xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <Button variant="outline" onClick={() => fileRef.current?.click()}>
        <FileCode className="w-4 h-4 mr-2" /> Importar XML
      </Button>
      <Button variant="outline" onClick={exportXml}>
        <Download className="w-4 h-4 mr-2" /> Exportar XML
      </Button>

      <Dialog open={!!preview} onOpenChange={(o) => !o && !importing && setPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Prévia da importação XML</DialogTitle>
            <DialogDescription>
              {preview?.categories.length ?? 0} categorias e {preview?.products.length ?? 0} produtos detectados.
              Registros com o mesmo slug serão atualizados. Categorias são importadas primeiro para que os produtos possam ser vinculados.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4 overflow-hidden">
            <div className="overflow-auto border rounded">
              <div className="p-2 bg-slate-50 border-b font-medium text-sm sticky top-0">Categorias</div>
              <table className="w-full text-xs">
                <tbody>
                  {preview?.categories.slice(0, 200).map((c, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{c.name}</td>
                      <td className="p-2 text-muted-foreground">{c.slug}</td>
                    </tr>
                  ))}
                  {!preview?.categories.length && (
                    <tr><td className="p-2 text-muted-foreground text-center">Nenhuma</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="overflow-auto border rounded">
              <div className="p-2 bg-slate-50 border-b font-medium text-sm sticky top-0">Produtos</div>
              <table className="w-full text-xs">
                <tbody>
                  {preview?.products.slice(0, 200).map((p, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{p.name}</td>
                      <td className="p-2 text-muted-foreground">{p.category_slug || "—"}</td>
                      <td className="p-2">{p.price}</td>
                    </tr>
                  ))}
                  {!preview?.products.length && (
                    <tr><td className="p-2 text-muted-foreground text-center">Nenhum</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {progress && (
            <div className="text-sm">
              <div>Importando {progress.done} / {progress.total}...</div>
              {progress.errors.length > 0 && (
                <div className="text-red-600 mt-2 max-h-32 overflow-auto">
                  {progress.errors.map((e, i) => <div key={i}>{e}</div>)}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreview(null)} disabled={importing}>Cancelar</Button>
            <Button onClick={runImport} disabled={importing}>
              {importing ? "Importando..." : "Importar tudo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
