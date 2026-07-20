import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, slugify, type Category } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ImageInput } from "@/components/admin/ImageInput";
import { SupabaseImage } from "@/components/SupabaseImage";

export const Route = createFileRoute("/_authenticated/admin/categorias")({
  component: CategoriesAdmin,
});

type Form = Partial<Category>;
const empty: Form = { name: "", slug: "", image_url: "", product_count: 0, sort_order: 0 };

function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [editing, setEditing] = useState<Form | null>(null);

  const save = useMutation({
    mutationFn: async (f: Form) => {
      const payload: any = {
        name: f.name, slug: f.slug || slugify(f.name || ""),
        image_url: f.image_url || null, product_count: f.product_count ?? 0, sort_order: f.sort_order ?? 0,
      };
      if (f.id) {
        const { error } = await supabase.from("categories").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setEditing(null); },
    onError: (e: any) => alert(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus className="w-4 h-4 mr-2" /> Nova categoria
        </Button>
      </div>

      <Card>
        <table className="w-full">
          <thead className="bg-slate-50 border-b text-left text-sm">
            <tr>
              <th className="p-3">Imagem</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Qtd. produtos</th>
              <th className="p-3">Ordem</th>
              <th className="p-3 w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{c.image_url && <SupabaseImage src={c.image_url} alt="" className="w-12 h-12 object-cover rounded" />}</td>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-sm text-muted-foreground">{c.slug}</td>
                <td className="p-3">{c.product_count}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(c)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => confirm(`Excluir "${c.name}"?`) && del.mutate(c.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Editar categoria" : "Nova categoria"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <ImageInput value={editing.image_url ?? ""} onChange={(url) => setEditing({ ...editing, image_url: url })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Qtd. produtos (exibição)</Label>
                  <Input type="number" value={editing.product_count ?? 0} onChange={(e) => setEditing({ ...editing, product_count: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Ordem</Label>
                  <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={() => editing && save.mutate(editing)} disabled={save.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
