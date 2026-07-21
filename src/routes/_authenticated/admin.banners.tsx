import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ImageInput } from "@/components/admin/ImageInput";
import { SupabaseImage } from "@/components/SupabaseImage";
import type { Banner } from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: BannersAdmin,
});

async function fetchAllBanners(): Promise<Banner[]> {
  const { data, error } = await supabase.from("banners").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as Banner[];
}

const empty: Partial<Banner> = { title: "", subtitle: "", image_url: "", link_url: "", sort_order: 0, active: true, start_at: null, end_at: null };

function BannersAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["admin-banners"], queryFn: fetchAllBanners });
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);

  const save = useMutation({
    mutationFn: async (f: Partial<Banner>) => {
      if (!f.image_url?.trim()) throw new Error("Informe ou envie uma imagem para o banner.");
      const payload: any = {
        title: f.title || null, subtitle: f.subtitle || null,
        image_url: f.image_url.trim(), link_url: f.link_url || null,
        sort_order: f.sort_order ?? 0, active: f.active ?? true,
        start_at: f.start_at || null,
        end_at: f.end_at || null,
      };
      if (f.id) {
        const { error } = await supabase.from("banners").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-banners"] }); setEditing(null); },
    onError: (e: any) => alert(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-banners"] }),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="w-4 h-4 mr-2" /> Novo banner</Button>
      </div>

      <div className="grid gap-4">
        {items.map((b) => (
          <Card key={b.id} className="p-4 flex gap-4 items-center">
            <SupabaseImage src={b.image_url} alt="" className="w-32 h-20 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{b.title ?? "(sem título)"}</div>
              <div className="text-sm text-muted-foreground">{b.subtitle}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Ordem: {b.sort_order} • {b.active ? <span className="text-emerald-600">Ativo</span> : "Inativo"}
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(b)}><Pencil className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => confirm("Excluir banner?") && del.mutate(b.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Editar banner" : "Novo banner"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Título</Label><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Subtítulo</Label><Input value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>
              <ImageInput label="Imagem *" value={editing.image_url ?? ""} onChange={(url) => setEditing({ ...editing, image_url: url })} />
              <div><Label>Link (URL)</Label><Input value={editing.link_url ?? ""} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Ordem</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={editing.active ?? true} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>Ativo</Label></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Início (agendamento)</Label>
                  <Input type="datetime-local" value={toLocalInput(editing.start_at)} onChange={(e) => setEditing({ ...editing, start_at: fromLocalInput(e.target.value) })} />
                </div>
                <div>
                  <Label>Fim (agendamento)</Label>
                  <Input type="datetime-local" value={toLocalInput(editing.end_at)} onChange={(e) => setEditing({ ...editing, end_at: fromLocalInput(e.target.value) })} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Deixe em branco para exibir sempre enquanto o banner estiver Ativo.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={() => editing && save.mutate(editing)} disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
