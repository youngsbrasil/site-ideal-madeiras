import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, X } from "lucide-react";
import { ImageInput } from "@/components/admin/ImageInput";
import { SupabaseImage } from "@/components/SupabaseImage";
import {
  fetchShoppableScenes,
  fetchAllProductsAdmin,
  type ShoppableScene,
  type ShoppablePin,
} from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/admin/shoppable")({
  component: ShoppableAdmin,
});

const emptyScene: Partial<ShoppableScene> = {
  title: "",
  image_url: "",
  active: true,
  sort_order: 0,
};

function ShoppableAdmin() {
  const qc = useQueryClient();
  const { data: scenes = [] } = useQuery({
    queryKey: ["admin-shoppable"],
    queryFn: () => fetchShoppableScenes(false),
  });
  const { data: products = [] } = useQuery({
    queryKey: ["admin-products-all"],
    queryFn: fetchAllProductsAdmin,
  });

  const [editing, setEditing] = useState<Partial<ShoppableScene> | null>(null);
  const [pinEditor, setPinEditor] = useState<ShoppableScene | null>(null);

  const saveScene = useMutation({
    mutationFn: async (f: Partial<ShoppableScene>) => {
      if (!f.image_url?.trim()) throw new Error("Envie uma imagem para a cena.");
      const payload: any = {
        title: f.title || null,
        image_url: f.image_url.trim(),
        active: f.active ?? true,
        sort_order: f.sort_order ?? 0,
      };
      if (f.id) {
        const { error } = await supabase.from("shoppable_scenes").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("shoppable_scenes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-shoppable"] });
      setEditing(null);
    },
    onError: (e: any) => alert(e.message),
  });

  const delScene = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shoppable_scenes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-shoppable"] }),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cenas com Pins</h1>
          <p className="text-sm text-muted-foreground">Publique uma imagem de ambiente e associe produtos a marcações interativas.</p>
        </div>
        <Button onClick={() => setEditing({ ...emptyScene })}><Plus className="w-4 h-4 mr-2" /> Nova cena</Button>
      </div>

      <div className="grid gap-4">
        {scenes.map((s) => (
          <Card key={s.id} className="p-4 flex gap-4 items-center">
            <SupabaseImage src={s.image_url} alt="" className="w-40 h-24 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{s.title ?? "(sem título)"}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {s.pins.length} pin(s) • Ordem: {s.sort_order} • {s.active ? <span className="text-emerald-600">Ativo</span> : "Inativo"}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setPinEditor(s)}>Editar pins</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(s)}>Configurar</Button>
              <Button size="sm" variant="ghost" onClick={() => confirm("Excluir cena?") && delScene.mutate(s.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
        {scenes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma cena cadastrada.</p>}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Editar cena" : "Nova cena"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Título</Label><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <ImageInput label="Imagem *" value={editing.image_url ?? ""} onChange={(url) => setEditing({ ...editing, image_url: url })} />
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Ordem</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={editing.active ?? true} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>Ativo</Label></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={() => editing && saveScene.mutate(editing)} disabled={saveScene.isPending}>{saveScene.isPending ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pinEditor && (
        <PinEditorDialog
          scene={pinEditor}
          products={products}
          onClose={() => setPinEditor(null)}
          onChanged={() => qc.invalidateQueries({ queryKey: ["admin-shoppable"] })}
        />
      )}
    </div>
  );
}

function PinEditorDialog({
  scene,
  products,
  onClose,
  onChanged,
}: {
  scene: ShoppableScene;
  products: { id: string; name: string; price: string }[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const qc = useQueryClient();
  const imgRef = useRef<HTMLDivElement>(null);
  const [pins, setPins] = useState<ShoppablePin[]>(scene.pins);
  const [selected, setSelected] = useState<string | null>(null);

  async function addPin(e: React.MouseEvent) {
    if (!imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const { data, error } = await supabase.from("shoppable_pins").insert({
      scene_id: scene.id, x, y, product_id: null,
    }).select().single();
    if (error) return alert(error.message);
    const p = { ...(data as any), x: Number(data.x), y: Number(data.y) } as ShoppablePin;
    setPins((prev) => [...prev, p]);
    setSelected(p.id);
    onChanged();
  }

  async function updatePin(id: string, patch: Partial<ShoppablePin>) {
    setPins((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    const { error } = await supabase.from("shoppable_pins").update(patch as any).eq("id", id);
    if (error) alert(error.message);
    else onChanged();
  }

  async function deletePin(id: string) {
    setPins((prev) => prev.filter((p) => p.id !== id));
    if (selected === id) setSelected(null);
    const { error } = await supabase.from("shoppable_pins").delete().eq("id", id);
    if (error) alert(error.message);
    else onChanged();
  }

  const active = pins.find((p) => p.id === selected);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Pins — {scene.title ?? "cena"}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">Clique na imagem para adicionar um pin, depois selecione o produto no painel lateral.</p>
        <div className="grid md:grid-cols-[1fr_280px] gap-4">
          <div
            ref={imgRef}
            onClick={addPin}
            className="relative w-full bg-neutral-100 rounded overflow-hidden cursor-crosshair select-none"
            style={{ aspectRatio: "16/9" }}
          >
            <SupabaseImage src={scene.image_url} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            {pins.map((p) => (
              <button
                key={p.id}
                onClick={(e) => { e.stopPropagation(); setSelected(p.id); }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg ${selected === p.id ? "bg-emerald-500" : "bg-[#f59318]"}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                title={p.label ?? ""}
              />
            ))}
          </div>
          <aside className="border rounded p-3 space-y-3 max-h-[70vh] overflow-auto">
            {!active && <p className="text-sm text-muted-foreground">Selecione um pin ou clique na imagem para criar.</p>}
            {active && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pin selecionado</span>
                  <Button size="sm" variant="ghost" onClick={() => deletePin(active.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <div>
                  <Label>Produto associado</Label>
                  <select
                    className="w-full border rounded px-2 py-2 text-sm"
                    value={active.product_id ?? ""}
                    onChange={(e) => updatePin(active.id, { product_id: e.target.value || null })}
                  >
                    <option value="">— nenhum —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {p.price}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Rótulo (opcional)</Label>
                  <Input value={active.label ?? ""} onChange={(e) => updatePin(active.id, { label: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>X %</Label>
                    <Input type="number" step="0.1" value={active.x.toFixed(1)} onChange={(e) => updatePin(active.id, { x: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Y %</Label>
                    <Input type="number" step="0.1" value={active.y.toFixed(1)} onChange={(e) => updatePin(active.id, { y: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
            )}
            <hr />
            <div className="text-xs text-muted-foreground">{pins.length} pin(s) na cena</div>
          </aside>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}><X className="w-4 h-4 mr-1" /> Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
