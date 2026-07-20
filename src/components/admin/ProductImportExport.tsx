import { useRef, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { slugify, type Product, type Category } from "@/lib/site-data";
import { useQueryClient } from "@tanstack/react-query";

type Row = Record<string, any>;

const norm = (s: any) =>
  String(s ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Pick a value by any of the provided header aliases (case/accent-insensitive)
function pick(row: Row, aliases: string[]): string {
  const map: Record<string, any> = {};
  for (const k of Object.keys(row)) map[norm(k)] = row[k];
  for (const a of aliases) {
    const v = map[norm(a)];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function parsePrice(v: string): { text: string; value: number | null } {
  if (!v) return { text: "", value: null };
  const clean = v.replace(/[^\d,.\-]/g, "");
  // Assume brazilian format if there's a comma after dots
  let num: number | null = null;
  if (clean.includes(",") && (clean.lastIndexOf(",") > clean.lastIndexOf("."))) {
    num = parseFloat(clean.replace(/\./g, "").replace(",", "."));
  } else {
    num = parseFloat(clean.replace(/,/g, ""));
  }
  if (isNaN(num as number)) num = null;
  const text = /^[\d.,\s\-]+$/.test(v.trim())
    ? (num !== null ? `R$ ${num.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` : v)
    : v;
  return { text, value: num };
}

const splitList = (v: string) =>
  v.split(/[,|;]/).map((s) => s.trim()).filter(Boolean);

const truthy = (v: string) => ["1", "true", "yes", "sim", "y", "publicado", "published", "visible"].includes(norm(v));

// Read attribute pairs (WooCommerce style: "Attribute 1 name" + "Attribute 1 value(s)")
function readAttributes(row: Row): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (let i = 1; i <= 10; i++) {
    const name = pick(row, [`Attribute ${i} name`, `Atributo ${i} nome`]);
    const val = pick(row, [`Attribute ${i} value(s)`, `Attribute ${i} values`, `Atributo ${i} valor(es)`, `Atributo ${i} valores`]);
    if (name && val) out[norm(name)] = splitList(val);
  }
  return out;
}

function mapRowToProduct(row: Row, categoriesByName: Map<string, string>) {
  const name = pick(row, ["Name", "Nome", "Título", "Title"]);
  if (!name) return null;

  const slugRaw = pick(row, ["Slug", "post_name"]);
  const slug = slugRaw ? slugify(slugRaw) : slugify(name);

  const regular = pick(row, ["Regular price", "Preço", "Preço regular", "Price"]);
  const sale = pick(row, ["Sale price", "Preço promocional"]);
  const useSale = !!sale;
  const priceStr = useSale ? sale : regular;
  const oldStr = useSale ? regular : "";
  const price = parsePrice(priceStr);
  const oldPrice = parsePrice(oldStr);

  const images = pick(row, ["Images", "Imagens", "Image"]);
  const imgs = splitList(images);
  const main_image = imgs[0] ?? null;
  const gallery = imgs.slice(1);

  const cats = pick(row, ["Categories", "Categorias", "Category"]);
  // WooCommerce nests with ">" (e.g. "Portas > Pivotante"); take the leaf of the first list item
  const firstCat = splitList(cats)[0] ?? "";
  const leafCat = firstCat.split(">").pop()?.trim() ?? "";
  const category_id = leafCat ? categoriesByName.get(norm(leafCat)) ?? null : null;

  const description = pick(row, ["Description", "Descrição", "Descricao", "Short description", "Descrição curta"]);

  const active = pick(row, ["Published", "Publicado", "Status"]) === "" ? true : truthy(pick(row, ["Published", "Publicado", "Status"]));
  const featured = truthy(pick(row, ["Is featured?", "Featured", "Destaque"]));

  const attrs = readAttributes(row);
  const findAttr = (keys: string[]) => {
    for (const k of keys) {
      const v = attrs[norm(k)];
      if (v && v.length) return v;
    }
    return [];
  };
  const sizes = pick(row, ["Sizes", "Tamanhos"]) ? splitList(pick(row, ["Sizes", "Tamanhos"])) : findAttr(["Tamanho", "Tamanhos", "Size"]);
  const types = pick(row, ["Types", "Tipos"]) ? splitList(pick(row, ["Types", "Tipos"])) : findAttr(["Tipo", "Tipos", "Type"]);
  const woods = pick(row, ["Woods", "Madeiras"]) ? splitList(pick(row, ["Woods", "Madeiras"])) : findAttr(["Madeira", "Madeiras", "Wood"]);
  const finishes = pick(row, ["Finishes", "Acabamentos"]) ? splitList(pick(row, ["Finishes", "Acabamentos"])) : findAttr(["Acabamento", "Acabamentos", "Finish"]);

  return {
    slug,
    name,
    price: price.text || priceStr || "",
    old_price: oldPrice.text || oldStr || null,
    price_value: price.value,
    category_id,
    main_image,
    gallery,
    description,
    specifications: [],
    sizes,
    types,
    woods,
    finishes,
    active,
    featured,
    most_viewed: false,
    sort_order: 0,
  };
}

async function parseFile(file: File): Promise<Row[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv" || ext === "txt" || ext === "tsv") {
    return new Promise((resolve, reject) => {
      Papa.parse<Row>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => resolve(res.data as Row[]),
        error: reject,
      });
    });
  }
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Row>(ws, { defval: "" });
}

export function ProductImportExport({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<any[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; errors: string[] } | null>(null);

  const catsByName = new Map(categories.map((c) => [norm(c.name), c.id]));

  const onFile = async (f: File) => {
    try {
      const rows = await parseFile(f);
      const mapped = rows.map((r) => mapRowToProduct(r, catsByName)).filter(Boolean) as any[];
      if (!mapped.length) {
        alert("Nenhuma linha válida encontrada. Verifique se há uma coluna 'Name' ou 'Nome'.");
        return;
      }
      setPreview(mapped);
    } catch (e: any) {
      alert("Erro ao ler arquivo: " + e.message);
    }
  };

  const runImport = async () => {
    if (!preview) return;
    setImporting(true);
    setProgress({ done: 0, total: preview.length, errors: [] });
    const errors: string[] = [];
    for (let i = 0; i < preview.length; i++) {
      const row = preview[i];
      // Upsert by slug to avoid duplicates
      const { error } = await supabase
        .from("products")
        .upsert(row, { onConflict: "slug" });
      if (error) errors.push(`${row.name}: ${error.message}`);
      setProgress({ done: i + 1, total: preview.length, errors: [...errors] });
    }
    setImporting(false);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    if (!errors.length) {
      setPreview(null);
      setProgress(null);
      alert(`${preview.length} produtos importados com sucesso.`);
    }
  };

  const buildExportRows = () => {
    const catById = new Map(categories.map((c) => [c.id, c.name]));
    return products.map((p) => ({
      ID: p.id,
      Type: "simple",
      SKU: "",
      Name: p.name,
      Slug: p.slug,
      Published: p.active ? 1 : 0,
      "Is featured?": p.featured ? 1 : 0,
      "Visibility in catalog": "visible",
      "Short description": "",
      Description: p.description ?? "",
      "Sale price": p.old_price ? p.price : "",
      "Regular price": p.old_price ?? p.price,
      Categories: p.category_id ? catById.get(p.category_id) ?? "" : "",
      Images: [p.main_image, ...(p.gallery ?? [])].filter(Boolean).join(", "),
      "Attribute 1 name": "Tamanho",
      "Attribute 1 value(s)": (p.sizes ?? []).join(" | "),
      "Attribute 2 name": "Tipo",
      "Attribute 2 value(s)": (p.types ?? []).join(" | "),
      "Attribute 3 name": "Madeira",
      "Attribute 3 value(s)": (p.woods ?? []).join(" | "),
      "Attribute 4 name": "Acabamento",
      "Attribute 4 value(s)": (p.finishes ?? []).join(" | "),
      Position: p.sort_order ?? 0,
    }));
  };

  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(buildExportRows());
    download(new Blob([csv], { type: "text/csv;charset=utf-8" }), "produtos.csv");
  };

  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(buildExportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produtos");
    const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    download(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "produtos.xlsx");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.tsv,.txt,.xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <Button variant="outline" onClick={() => fileRef.current?.click()}>
        <Upload className="w-4 h-4 mr-2" /> Importar CSV/Excel
      </Button>
      <Button variant="outline" onClick={exportCSV}>
        <Download className="w-4 h-4 mr-2" /> Exportar CSV
      </Button>
      <Button variant="outline" onClick={exportXLSX}>
        <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar Excel
      </Button>

      <Dialog open={!!preview} onOpenChange={(o) => !o && !importing && setPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Prévia da importação</DialogTitle>
            <DialogDescription>
              {preview?.length} produtos detectados. Registros existentes com o mesmo slug serão atualizados.
              Categorias não encontradas ficarão em branco (crie-as antes se necessário).
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-auto border rounded">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b sticky top-0">
                <tr>
                  <th className="p-2 text-left">Nome</th>
                  <th className="p-2 text-left">Slug</th>
                  <th className="p-2 text-left">Preço</th>
                  <th className="p-2 text-left">Categoria</th>
                  <th className="p-2 text-left">Imagens</th>
                  <th className="p-2 text-left">Filtros</th>
                </tr>
              </thead>
              <tbody>
                {preview?.slice(0, 100).map((r, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{r.name}</td>
                    <td className="p-2 text-muted-foreground">{r.slug}</td>
                    <td className="p-2">{r.price}</td>
                    <td className="p-2">
                      {r.category_id
                        ? categories.find((c) => c.id === r.category_id)?.name
                        : <span className="text-amber-600">—</span>}
                    </td>
                    <td className="p-2">{(r.main_image ? 1 : 0) + (r.gallery?.length ?? 0)}</td>
                    <td className="p-2 text-muted-foreground">
                      {[
                        r.sizes?.length && `${r.sizes.length} tam.`,
                        r.types?.length && `${r.types.length} tipo`,
                        r.woods?.length && `${r.woods.length} mad.`,
                        r.finishes?.length && `${r.finishes.length} acab.`,
                      ].filter(Boolean).join(" · ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview && preview.length > 100 && (
              <div className="p-2 text-center text-xs text-muted-foreground">
                Mostrando 100 de {preview.length} linhas.
              </div>
            )}
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
              {importing ? "Importando..." : `Importar ${preview?.length} produtos`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
