import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchAllProductsAdmin, fetchCategories, slugify, formatPriceDisplay,
  fetchProductVariations, fetchProductImages, fetchProductRelated,
  type Product, type ProductVariation, type ProductImage, type ProductRelated,
} from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { ImageInput } from "@/components/admin/ImageInput";
import { SupabaseImage } from "@/components/SupabaseImage";
import { ProductImportExport } from "@/components/admin/ProductImportExport";
import { ProductXmlImportExport } from "@/components/admin/ProductXmlImportExport";

export const Route = createFileRoute("/_authenticated/admin/produtos")({
  component: ProductsAdmin,
});

type FormState = Partial<Product> & {
  gallery: string[];
  specifications: { label: string; valor: string }[];
  sizes: string[];
  types: string[];
  woods: string[];
  finishes: string[];
};

const empty: FormState = {
  slug: "",
  name: "",
  price: "",
  old_price: "",
  category_id: null,
  main_image: "",
  gallery: [],
  description: "",
  specifications: [],
  featured: false,
  most_viewed: false,
  active: true,
  sort_order: 0,
  sizes: [],
  types: [],
  woods: [],
  finishes: [],
  price_value: null,
  availability: null,
  meta_title: "",
  meta_description: "",
  canonical: "",
  og_image: "",
  noindex: false,
};

const parseList = (s: string) => s.split(",").map((v) => v.trim()).filter(Boolean);

const AVAILABILITY_OPTIONS = [
  { value: "__none__", label: "— não definido —" },
  { value: "disponivel", label: "Disponível" },
  { value: "sob_consulta", label: "Sob consulta" },
  { value: "esgotado", label: "Esgotado" },
];

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: fetchAllProductsAdmin });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [editing, setEditing] = useState<FormState | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);

  const save = useMutation({
    mutationFn: async (form: FormState) => {
      const payload: any = {
        slug: form.slug || slugify(form.name || ""),
        name: form.name,
        price: form.price,
        old_price: form.old_price || null,
        category_id: form.category_id || null,
        main_image: form.main_image,
        gallery: form.gallery,
        description: form.description,
        specifications: form.specifications,
        featured: form.featured,
        most_viewed: form.most_viewed,
        active: form.active,
        sort_order: form.sort_order ?? 0,
        sizes: form.sizes,
        types: form.types,
        woods: form.woods,
        finishes: form.finishes,
        price_value: form.price_value ?? null,
        availability: form.availability ?? null,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        canonical: form.canonical || null,
        og_image: form.og_image || null,
        noindex: form.noindex ?? false,
      };
      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
        return form.id;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        return data.id as string;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setEditing(null);
    },
    onError: (e: any) => alert(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const allVisibleSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleAll = () => {
    const s = new Set(selected);
    if (allVisibleSelected) filtered.forEach((p) => s.delete(p.id));
    else filtered.forEach((p) => s.add(p.id));
    setSelected(s);
  };
  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const bulkUpdate = useMutation({
    mutationFn: async (patch: Record<string, any>) => {
      const ids = Array.from(selected);
      if (ids.length === 0) return;
      const { error } = await supabase.from("products").update(patch as any).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setBulkOpen(false);
      setSelected(new Set());
    },
    onError: (e: any) => alert(e.message),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <ProductImportExport products={products} categories={categories} />
          <ProductXmlImportExport products={products} categories={categories} />
          <Button onClick={() => setEditing({ ...empty })}>
            <Plus className="w-4 h-4 mr-2" /> Novo produto
          </Button>
        </div>
      </div>

      <Card className="p-4 mb-4 flex items-center gap-3 flex-wrap">
        <Input className="flex-1 min-w-64" placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {selected.size > 0 && (
          <>
            <span className="text-sm text-muted-foreground">{selected.size} selecionado(s)</span>
            <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>Editar em massa</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Limpar</Button>
          </>
        )}
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b text-left text-sm">
              <tr>
                <th className="p-3 w-10">
                  <Checkbox checked={allVisibleSelected} onCheckedChange={toggleAll} />
                </th>
                <th className="p-3">Imagem</th>
                <th className="p-3">Nome</th>
                <th className="p-3">Preço</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Status</th>
                <th className="p-3 w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">
                    <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} />
                  </td>
                  <td className="p-3">
                    {p.main_image && <SupabaseImage src={p.main_image} alt="" className="w-12 h-12 object-cover rounded" />}
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                  </td>
                  <td className="p-3 font-medium">{formatPriceDisplay(p)}</td>
                  <td className="p-3 text-sm">{categories.find((c) => c.id === p.category_id)?.name ?? "-"}</td>
                  <td className="p-3 text-sm">
                    {p.active ? <span className="text-emerald-600">Ativo</span> : <span className="text-slate-400">Inativo</span>}
                    {p.featured && <span className="ml-2 text-amber-600">★</span>}
                    {p.availability && <span className="ml-2 text-xs text-slate-500">· {AVAILABILITY_OPTIONS.find(o => o.value === p.availability)?.label ?? p.availability}</span>}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing({ ...p } as FormState)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => confirm(`Excluir "${p.name}"?`) && del.mutate(p.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <ProductForm
              value={editing}
              onChange={setEditing}
              categories={categories}
              allProducts={products}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={() => editing && save.mutate(editing)} disabled={save.isPending}>
              {save.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BulkEditDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        count={selected.size}
        categories={categories}
        onApply={(patch) => bulkUpdate.mutate(patch)}
        pending={bulkUpdate.isPending}
      />
    </div>
  );
}

function BulkEditDialog({
  open, onClose, count, categories, onApply, pending,
}: {
  open: boolean; onClose: () => void; count: number;
  categories: { id: string; name: string }[];
  onApply: (patch: Record<string, any>) => void;
  pending: boolean;
}) {
  const [category, setCategory] = useState<string>("");
  const [active, setActive] = useState<string>("");
  const [availability, setAvailability] = useState<string>("");
  const [featured, setFeatured] = useState<string>("");

  useEffect(() => {
    if (!open) { setCategory(""); setActive(""); setAvailability(""); setFeatured(""); }
  }, [open]);

  const apply = () => {
    const patch: Record<string, any> = {};
    if (category) patch.category_id = category === "__null__" ? null : category;
    if (active) patch.active = active === "true";
    if (availability) patch.availability = availability === "__null__" ? null : availability;
    if (featured) patch.featured = featured === "true";
    if (Object.keys(patch).length === 0) { onClose(); return; }
    onApply(patch);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar em massa ({count})</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Não alterar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__null__">Sem categoria</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={active} onValueChange={setActive}>
              <SelectTrigger><SelectValue placeholder="Não alterar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Disponibilidade</Label>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger><SelectValue placeholder="Não alterar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__null__">— limpar —</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="sob_consulta">Sob consulta</SelectItem>
                <SelectItem value="esgotado">Esgotado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Destaque</Label>
            <Select value={featured} onValueChange={setFeatured}>
              <SelectTrigger><SelectValue placeholder="Não alterar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={apply} disabled={pending}>{pending ? "Aplicando..." : "Aplicar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductForm({
  value, onChange, categories, allProducts,
}: {
  value: FormState;
  onChange: (v: FormState) => void;
  categories: { id: string; name: string }[];
  allProducts: Product[];
}) {
  const set = (patch: Partial<FormState>) => onChange({ ...value, ...patch });
  const availabilityValue = value.availability ?? "__none__";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nome *</Label>
          <Input
            value={value.name ?? ""}
            onChange={(e) => set({ name: e.target.value, slug: value.slug || slugify(e.target.value) })}
          />
        </div>
        <div>
          <Label>Slug (URL)</Label>
          <Input value={value.slug ?? ""} onChange={(e) => set({ slug: e.target.value })} />
        </div>
        <div>
          <Label>Preço (texto exibido)</Label>
          <Input value={value.price ?? ""} onChange={(e) => set({ price: e.target.value })} placeholder="R$ 1.000,00" />
        </div>
        <div>
          <Label>Preço antigo</Label>
          <Input value={value.old_price ?? ""} onChange={(e) => set({ old_price: e.target.value })} placeholder="R$ 1.500,00" />
        </div>
        <div>
          <Label>Categoria</Label>
          <Select value={value.category_id ?? ""} onValueChange={(v) => set({ category_id: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Disponibilidade</Label>
          <Select
            value={availabilityValue}
            onValueChange={(v) => set({ availability: v === "__none__" ? null : v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {AVAILABILITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Ordem</Label>
          <Input type="number" value={value.sort_order ?? 0} onChange={(e) => set({ sort_order: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <Label>Preço numérico (BRL, para filtros e ordenação)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="Ex: 1250.00"
            value={value.price_value ?? ""}
            onChange={(e) => set({ price_value: e.target.value === "" ? null : parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <ImageInput label="Imagem principal" value={value.main_image ?? ""} onChange={(url) => set({ main_image: url })} />

      <div>
        <Label>Galeria de imagens (simples)</Label>
        <div className="space-y-2">
          {value.gallery.map((url, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1">
                <ImageInput
                  label=""
                  value={url}
                  onChange={(newUrl) => {
                    const g = [...value.gallery];
                    g[i] = newUrl;
                    set({ gallery: g });
                  }}
                />
              </div>
              <Button size="icon" variant="ghost" onClick={() => set({ gallery: value.gallery.filter((_, j) => j !== i) })}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => set({ gallery: [...value.gallery, ""] })}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar imagem
          </Button>
        </div>
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea rows={4} value={value.description ?? ""} onChange={(e) => set({ description: e.target.value })} />
      </div>

      <div>
        <Label>Especificações</Label>
        <div className="space-y-2">
          {value.specifications.map((s, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="Rótulo (ex: Marca)"
                value={s.label}
                onChange={(e) => {
                  const arr = [...value.specifications];
                  arr[i] = { ...arr[i], label: e.target.value };
                  set({ specifications: arr });
                }}
              />
              <Input
                placeholder="Valor"
                value={s.valor}
                onChange={(e) => {
                  const arr = [...value.specifications];
                  arr[i] = { ...arr[i], valor: e.target.value };
                  set({ specifications: arr });
                }}
              />
              <Button size="icon" variant="ghost" onClick={() => set({ specifications: value.specifications.filter((_, j) => j !== i) })}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => set({ specifications: [...value.specifications, { label: "", valor: "" }] })}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar especificação
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Label className="text-base">Filtros de busca</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Valores separados por vírgula. Aparecem como filtros nas páginas de categoria e busca.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tamanhos</Label>
            <Input
              placeholder="Ex: 60cm, 70cm, 80cm"
              value={(value.sizes ?? []).join(", ")}
              onChange={(e) => set({ sizes: parseList(e.target.value) })}
            />
          </div>
          <div>
            <Label>Tipos</Label>
            <Input
              placeholder="Ex: Pivotante, De abrir"
              value={(value.types ?? []).join(", ")}
              onChange={(e) => set({ types: parseList(e.target.value) })}
            />
          </div>
          <div>
            <Label>Madeiras</Label>
            <Input
              placeholder="Ex: Angelim, Cedro, Freijó"
              value={(value.woods ?? []).join(", ")}
              onChange={(e) => set({ woods: parseList(e.target.value) })}
            />
          </div>
          <div>
            <Label>Acabamentos</Label>
            <Input
              placeholder="Ex: Natural, Envernizado, Pintado"
              value={(value.finishes ?? []).join(", ")}
              onChange={(e) => set({ finishes: parseList(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <Switch checked={value.active ?? true} onCheckedChange={(v) => set({ active: v })} />
          <Label>Ativo</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={value.featured ?? false} onCheckedChange={(v) => set({ featured: v })} />
          <Label>Destaque</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={value.most_viewed ?? false} onCheckedChange={(v) => set({ most_viewed: v })} />
          <Label>Mais visto</Label>
        </div>
      </div>

      {value.id ? (
        <>
          <VariationsEditor productId={value.id} />
          <ExtendedGalleryEditor productId={value.id} />
          <RelatedProductsEditor productId={value.id} allProducts={allProducts} />
        </>
      ) : (
        <div className="p-3 rounded bg-slate-50 text-sm text-slate-500 border">
          Salve o produto para gerenciar variações, galeria estendida e produtos relacionados.
        </div>
      )}

      {/* SEO */}
      <div className="pt-4 border-t">
        <Label className="text-base">SEO</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Opcional. Vazio usa <code>{"{nome} | Ideal Madeiras"}</code> como título.
        </p>
        <div className="space-y-3">
          <div>
            <Label>Meta title</Label>
            <Input
              placeholder={`${value.name || "Nome do produto"} | Ideal Madeiras`}
              value={value.meta_title ?? ""}
              onChange={(e) => set({ meta_title: e.target.value })}
            />
          </div>
          <div>
            <Label>Meta description</Label>
            <Textarea
              rows={2}
              maxLength={200}
              placeholder="Descrição curta que aparece no Google (até 160 caracteres)."
              value={value.meta_description ?? ""}
              onChange={(e) => set({ meta_description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Canonical (URL)</Label>
              <Input
                placeholder="https://..."
                value={value.canonical ?? ""}
                onChange={(e) => set({ canonical: e.target.value })}
              />
            </div>
            <div>
              <Label>OG Image (URL)</Label>
              <Input
                placeholder="https://..."
                value={value.og_image ?? ""}
                onChange={(e) => set({ og_image: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={value.noindex ?? false} onCheckedChange={(v) => set({ noindex: v })} />
            <Label>Noindex (esconder dos buscadores)</Label>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Variations ---------------- */
function VariationsEditor({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["product-variations", productId],
    queryFn: () => fetchProductVariations(productId),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["product-variations", productId] });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("product_variations" as any).insert({
        product_id: productId, atributo: "", valor: "", disponivel: true, ordem: rows.length,
      });
      if (error) throw error;
    },
    onSuccess: invalidate, onError: (e: any) => alert(e.message),
  });
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ProductVariation> }) => {
      const { error } = await supabase.from("product_variations" as any).update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_variations" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return (
    <div className="pt-4 border-t">
      <Label className="text-base">Variações</Label>
      <p className="text-xs text-muted-foreground mb-3">
        Ex.: Dimensão × 80cm, Acabamento × Verniz, Lado de abertura × Direita.
      </p>
      <div className="space-y-2">
        {rows.map((v) => (
          <div key={v.id} className="grid grid-cols-12 gap-2 items-center">
            <Input className="col-span-3" placeholder="Atributo" defaultValue={v.atributo}
              onBlur={(e) => e.target.value !== v.atributo && update.mutate({ id: v.id, patch: { atributo: e.target.value } })} />
            <Input className="col-span-3" placeholder="Valor" defaultValue={v.valor}
              onBlur={(e) => e.target.value !== v.valor && update.mutate({ id: v.id, patch: { valor: e.target.value } })} />
            <Input className="col-span-3" placeholder="SKU" defaultValue={v.sku ?? ""}
              onBlur={(e) => e.target.value !== (v.sku ?? "") && update.mutate({ id: v.id, patch: { sku: e.target.value || null } })} />
            <div className="col-span-2 flex items-center gap-2">
              <Switch checked={v.disponivel} onCheckedChange={(c) => update.mutate({ id: v.id, patch: { disponivel: c } })} />
              <span className="text-xs">Disponível</span>
            </div>
            <Button className="col-span-1" size="icon" variant="ghost" onClick={() => remove.mutate(v.id)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => add.mutate()}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar variação
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Extended gallery ---------------- */
function ExtendedGalleryEditor({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["product-images", productId],
    queryFn: () => fetchProductImages(productId),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["product-images", productId] });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("product_images" as any).insert({
        product_id: productId, url: "", alt: "", ordem: rows.length,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ProductImage> }) => {
      const { error } = await supabase.from("product_images" as any).update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_images" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return (
    <div className="pt-4 border-t">
      <Label className="text-base">Galeria estendida (com alt obrigatório)</Label>
      <p className="text-xs text-muted-foreground mb-3">
        Independente da galeria simples acima. Recomendada para SEO — cada imagem exige texto alternativo.
      </p>
      <div className="space-y-3">
        {rows.map((img) => (
          <div key={img.id} className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-6">
              <ImageInput label="" value={img.url} onChange={(url) => update.mutate({ id: img.id, patch: { url } })} />
            </div>
            <div className="col-span-5">
              <Input placeholder="Texto alternativo (alt) *" defaultValue={img.alt}
                onBlur={(e) => e.target.value !== img.alt && update.mutate({ id: img.id, patch: { alt: e.target.value } })} />
              <Input className="mt-1" type="number" placeholder="Ordem" defaultValue={img.ordem}
                onBlur={(e) => {
                  const n = parseInt(e.target.value) || 0;
                  if (n !== img.ordem) update.mutate({ id: img.id, patch: { ordem: n } });
                }} />
            </div>
            <Button className="col-span-1" size="icon" variant="ghost" onClick={() => remove.mutate(img.id)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => add.mutate()}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar imagem
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Related products ---------------- */
function RelatedProductsEditor({ productId, allProducts }: { productId: string; allProducts: Product[] }) {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["product-related", productId],
    queryFn: () => fetchProductRelated(productId),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["product-related", productId] });
  const [pick, setPick] = useState<string>("");

  const add = useMutation({
    mutationFn: async (relatedId: string) => {
      if (!relatedId || relatedId === productId) return;
      const { error } = await supabase.from("product_related" as any).insert({
        product_id: productId, related_id: relatedId, ordem: rows.length,
      });
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); setPick(""); },
    onError: (e: any) => alert(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_related" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const map = new Map(allProducts.map((p) => [p.id, p]));
  const available = allProducts.filter((p) => p.id !== productId && !rows.some((r) => r.related_id === p.id));

  return (
    <div className="pt-4 border-t">
      <Label className="text-base">Produtos relacionados</Label>
      <div className="flex gap-2 my-2">
        <Select value={pick} onValueChange={setPick}>
          <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
          <SelectContent className="max-h-80">
            {available.slice(0, 200).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => pick && add.mutate(pick)} disabled={!pick}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </div>
      <div className="space-y-1">
        {rows.map((r) => {
          const p = map.get(r.related_id);
          return (
            <div key={r.id} className="flex items-center gap-2 py-1 border-b text-sm">
              {p?.main_image && <SupabaseImage src={p.main_image} alt="" className="w-8 h-8 object-cover rounded" />}
              <span className="flex-1">{p?.name ?? r.related_id}</span>
              <Button size="icon" variant="ghost" onClick={() => remove.mutate(r.id)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
        {rows.length === 0 && <div className="text-xs text-muted-foreground">Nenhum produto relacionado.</div>}
      </div>
    </div>
  );
}
