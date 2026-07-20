import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllProductsAdmin, fetchCategories, slugify, type Product } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
};

const parseList = (s: string) => s.split(",").map((v) => v.trim()).filter(Boolean);

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: fetchAllProductsAdmin });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [editing, setEditing] = useState<FormState | null>(null);
  const [search, setSearch] = useState("");

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
      };
      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus className="w-4 h-4 mr-2" /> Novo produto
        </Button>
      </div>

      <Card className="p-4 mb-4">
        <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b text-left text-sm">
              <tr>
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
                    {p.main_image && <SupabaseImage src={p.main_image} alt="" className="w-12 h-12 object-cover rounded" />}
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                  </td>
                  <td className="p-3">{p.price}</td>
                  <td className="p-3 text-sm">{categories.find((c) => c.id === p.category_id)?.name ?? "-"}</td>
                  <td className="p-3 text-sm">
                    {p.active ? <span className="text-emerald-600">Ativo</span> : <span className="text-slate-400">Inativo</span>}
                    {p.featured && <span className="ml-2 text-amber-600">★ Destaque</span>}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <ProductForm
              value={editing}
              onChange={setEditing}
              categories={categories}
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
    </div>
  );
}

function ProductForm({
  value, onChange, categories,
}: {
  value: FormState;
  onChange: (v: FormState) => void;
  categories: { id: string; name: string }[];
}) {
  const set = (patch: Partial<FormState>) => onChange({ ...value, ...patch });

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
          <Label>Preço *</Label>
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
          <Label>Ordem</Label>
          <Input type="number" value={value.sort_order ?? 0} onChange={(e) => set({ sort_order: parseInt(e.target.value) || 0 })} />
        </div>
      </div>

      <ImageInput label="Imagem principal" value={value.main_image ?? ""} onChange={(url) => set({ main_image: url })} />

      <div>
        <Label>Galeria de imagens</Label>
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
          <div>
            <Label>Preço numérico (para filtro de faixa)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Ex: 1250.00"
              value={value.price_value ?? ""}
              onChange={(e) => set({ price_value: e.target.value === "" ? null : parseFloat(e.target.value) })}
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
    </div>
  );
}
