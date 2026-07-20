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
import { Plus, Pencil, Trash2, GripVertical, ChevronRight, ChevronDown, CornerDownRight } from "lucide-react";
import { ImageInput } from "@/components/admin/ImageInput";
import { SupabaseImage } from "@/components/SupabaseImage";

export const Route = createFileRoute("/_authenticated/admin/categorias")({
  component: CategoriesAdmin,
});

type Form = Partial<Category>;
const empty: Form = { name: "", slug: "", image_url: "", product_count: 0, sort_order: 0, parent_id: null };

type DropZone = { targetId: string | null; mode: "child" | "before" | "after" } | null;

function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [editing, setEditing] = useState<Form | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropZone, setDropZone] = useState<DropZone>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const save = useMutation({
    mutationFn: async (f: Form) => {
      const payload: any = {
        name: f.name,
        slug: f.slug || slugify(f.name || ""),
        image_url: f.image_url || null,
        product_count: f.product_count ?? 0,
        sort_order: f.sort_order ?? 0,
        parent_id: f.parent_id || null,
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

  const moveMut = useMutation({
    mutationFn: async (updates: { id: string; parent_id: string | null; sort_order: number }[]) => {
      for (const u of updates) {
        const { error } = await supabase.from("categories")
          .update({ parent_id: u.parent_id, sort_order: u.sort_order }).eq("id", u.id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onError: (e: any) => alert(e.message),
  });

  // Detect descendants to prevent dropping a node into itself/descendant
  const isDescendant = (ancestorId: string, nodeId: string): boolean => {
    const node = items.find((i) => i.id === nodeId);
    if (!node || !node.parent_id) return false;
    if (node.parent_id === ancestorId) return true;
    return isDescendant(ancestorId, node.parent_id);
  };

  const handleDrop = () => {
    if (!dragId || !dropZone) { setDragId(null); setDropZone(null); return; }
    const dragged = items.find((i) => i.id === dragId);
    if (!dragged) { setDragId(null); setDropZone(null); return; }

    let newParent: string | null;
    let siblings: Category[];

    if (dropZone.mode === "child") {
      // Prevent dropping into itself or a descendant
      if (dropZone.targetId === dragId || (dropZone.targetId && isDescendant(dragId, dropZone.targetId))) {
        setDragId(null); setDropZone(null); return;
      }
      newParent = dropZone.targetId;
      siblings = items.filter((c) => (c.parent_id ?? null) === newParent && c.id !== dragId);
      const updates = [
        ...siblings.map((c, i) => ({ id: c.id, parent_id: newParent, sort_order: i })),
        { id: dragId, parent_id: newParent, sort_order: siblings.length },
      ];
      moveMut.mutate(updates);
    } else {
      const target = items.find((i) => i.id === dropZone.targetId);
      if (!target) { setDragId(null); setDropZone(null); return; }
      newParent = target.parent_id ?? null;
      if (dropZone.targetId && isDescendant(dragId, dropZone.targetId)) {
        setDragId(null); setDropZone(null); return;
      }
      siblings = items.filter((c) => (c.parent_id ?? null) === newParent && c.id !== dragId)
        .sort((a, b) => a.sort_order - b.sort_order);
      const targetIdx = siblings.findIndex((s) => s.id === target.id);
      const insertAt = dropZone.mode === "before" ? targetIdx : targetIdx + 1;
      siblings.splice(insertAt, 0, { ...dragged, parent_id: newParent });
      moveMut.mutate(siblings.map((c, i) => ({ id: c.id, parent_id: newParent, sort_order: i })));
    }

    setDragId(null); setDropZone(null);
  };

  const roots = items.filter((c) => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);
  const childrenOf = (id: string) =>
    items.filter((c) => c.parent_id === id).sort((a, b) => a.sort_order - b.sort_order);

  const toggle = (id: string) => {
    const n = new Set(collapsed);
    n.has(id) ? n.delete(id) : n.add(id);
    setCollapsed(n);
  };

  const renderRow = (c: Category, depth: number) => {
    const kids = childrenOf(c.id);
    const isCollapsed = collapsed.has(c.id);
    const isDragging = dragId === c.id;
    const zone = dropZone?.targetId === c.id ? dropZone.mode : null;

    return (
      <div key={c.id}>
        {/* before-drop indicator */}
        <div
          className={`h-1 -my-0.5 ${zone === "before" ? "bg-[#f59318]" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDropZone({ targetId: c.id, mode: "before" }); }}
          onDrop={handleDrop}
        />
        <div
          draggable
          onDragStart={() => setDragId(c.id)}
          onDragEnd={() => { setDragId(null); setDropZone(null); }}
          onDragOver={(e) => {
            e.preventDefault();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const y = e.clientY - rect.top;
            const h = rect.height;
            // top 25% = before, bottom 25% = after, middle = child
            const mode = y < h * 0.25 ? "before" : y > h * 0.75 ? "after" : "child";
            setDropZone({ targetId: c.id, mode });
          }}
          onDrop={handleDrop}
          className={`flex items-center gap-2 p-2 border-b hover:bg-slate-50 ${isDragging ? "opacity-40" : ""} ${zone === "child" ? "bg-orange-50 outline outline-2 outline-[#f59318]" : ""}`}
          style={{ paddingLeft: 8 + depth * 24 }}
        >
          <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab shrink-0" />
          {kids.length > 0 ? (
            <button onClick={() => toggle(c.id)} className="shrink-0">
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          ) : depth > 0 ? (
            <CornerDownRight className="w-4 h-4 text-neutral-300 shrink-0" />
          ) : (
            <span className="w-4 shrink-0" />
          )}
          {c.image_url && <SupabaseImage src={c.image_url} alt="" className="w-8 h-8 object-cover rounded shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{c.name}</div>
            <div className="text-xs text-muted-foreground truncate">/{c.slug} · {c.product_count} produtos</div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button size="sm" variant="ghost" onClick={() => setEditing(c)}><Pencil className="w-4 h-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => confirm(`Excluir "${c.name}"? Subcategorias ficarão como principais.`) && del.mutate(c.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
        {/* after-drop indicator (only if no children shown) */}
        {(kids.length === 0 || isCollapsed) && (
          <div
            className={`h-1 -my-0.5 ${zone === "after" ? "bg-[#f59318]" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDropZone({ targetId: c.id, mode: "after" }); }}
            onDrop={handleDrop}
          />
        )}
        {!isCollapsed && kids.map((k) => renderRow(k, depth + 1))}
      </div>
    );
  };

  const parentOptions = items.filter((c) => c.id !== editing?.id && (!editing?.id || !isDescendant(editing.id, c.id)));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Arraste para reordenar. Solte <strong>no meio</strong> de uma categoria para torná-la subcategoria; solte <strong>no topo/fundo</strong> para reordenar no mesmo nível.
          </p>
        </div>
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus className="w-4 h-4 mr-2" /> Nova categoria
        </Button>
      </div>

      <Card>
        {/* Root drop zone */}
        <div
          className={`p-3 text-xs text-center border-b border-dashed ${dropZone?.targetId === null ? "bg-orange-50 text-[#f59318] font-semibold" : "text-muted-foreground"}`}
          onDragOver={(e) => { e.preventDefault(); setDropZone({ targetId: null, mode: "child" }); }}
          onDrop={handleDrop}
        >
          ⬇ Solte aqui para tornar categoria principal
        </div>
        {roots.map((r) => renderRow(r, 0))}
        {roots.length === 0 && <div className="p-6 text-center text-muted-foreground">Nenhuma categoria cadastrada.</div>}
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
              <div>
                <Label>Categoria pai</Label>
                <select
                  className="w-full h-10 border rounded-md px-3 bg-background text-sm"
                  value={editing.parent_id ?? ""}
                  onChange={(e) => setEditing({ ...editing, parent_id: e.target.value || null })}
                >
                  <option value="">— Nenhuma (categoria principal) —</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <ImageInput label="Thumbnail (aparece na home e no menu)" value={editing.image_url ?? ""} onChange={(url) => setEditing({ ...editing, image_url: url })} />
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
