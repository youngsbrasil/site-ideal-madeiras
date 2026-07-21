import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Star, RefreshCw, Eye, EyeOff, StarOff } from "lucide-react";
import { Stars } from "@/components/Stars";
import type { Review, ReviewWidget } from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/admin/avaliacoes")({
  component: ReviewsAdmin,
});

async function fetchAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews" as any).select("*")
    .order("featured", { ascending: false })
    .order("sort_order")
    .order("review_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Review[];
}

async function fetchAllWidgets(): Promise<ReviewWidget[]> {
  const { data, error } = await supabase.from("review_widgets" as any).select("*").order("scope");
  if (error) throw error;
  return (data ?? []) as unknown as ReviewWidget[];
}

function ReviewsAdmin() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Star className="w-6 h-6" /> Avaliações</h1>
      </div>
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          <TabsTrigger value="widgets">Widgets por página</TabsTrigger>
          <TabsTrigger value="sync">Sincronização Trustindex</TabsTrigger>
        </TabsList>
        <TabsContent value="reviews"><ReviewsTab /></TabsContent>
        <TabsContent value="widgets"><WidgetsTab /></TabsContent>
        <TabsContent value="sync"><SyncTab /></TabsContent>
      </Tabs>
    </div>
  );
}

const emptyReview: Partial<Review> = {
  source: "manual", author_name: "", rating: 5, content: "",
  featured: false, hidden: false, sort_order: 0, review_date: new Date().toISOString(),
};

function ReviewsTab() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["admin-reviews"], queryFn: fetchAllReviews });
  const [editing, setEditing] = useState<Partial<Review> | null>(null);
  const [filter, setFilter] = useState<"all" | "featured" | "hidden">("all");

  const filtered = items.filter((r) => {
    if (filter === "featured") return r.featured;
    if (filter === "hidden") return r.hidden;
    return true;
  });

  const patch = useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<Review> }) => {
      const { error } = await supabase.from("reviews" as any).update(changes).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  const save = useMutation({
    mutationFn: async (f: Partial<Review>) => {
      if (!f.author_name?.trim()) throw new Error("Informe o autor.");
      const payload: any = {
        source: f.source || "manual",
        external_id: f.external_id || null,
        author_name: f.author_name.trim(),
        author_avatar_url: f.author_avatar_url || null,
        rating: Number(f.rating) || 5,
        content: f.content || null,
        review_date: f.review_date || new Date().toISOString(),
        language: f.language || null,
        featured: f.featured ?? false,
        hidden: f.hidden ?? false,
        sort_order: f.sort_order ?? 0,
        reply: f.reply || null,
      };
      if (f.id) {
        const { error } = await supabase.from("reviews" as any).update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reviews" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); setEditing(null); },
    onError: (e: any) => alert(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["all", "featured", "hidden"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f === "all" ? `Todas (${items.length})` : f === "featured" ? `Em destaque (${items.filter(i => i.featured).length})` : `Ocultas (${items.filter(i => i.hidden).length})`}
            </Button>
          ))}
        </div>
        <Button onClick={() => setEditing({ ...emptyReview })}><Plus className="w-4 h-4 mr-2" /> Nova avaliação</Button>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b text-left">
            <tr>
              <th className="p-3">Autor</th>
              <th className="p-3">Nota</th>
              <th className="p-3">Comentário</th>
              <th className="p-3">Data</th>
              <th className="p-3">Fonte</th>
              <th className="p-3 w-40">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className={`border-b hover:bg-slate-50 ${r.hidden ? "opacity-50" : ""}`}>
                <td className="p-3 font-medium">
                  {r.author_name}
                  {r.featured && <span className="ml-2 text-[10px] uppercase text-amber-600 font-bold">★ Destaque</span>}
                </td>
                <td className="p-3"><Stars value={r.rating} /></td>
                <td className="p-3 max-w-md"><p className="line-clamp-2 text-neutral-600">{r.content}</p></td>
                <td className="p-3 text-xs">{r.review_date ? new Date(r.review_date).toLocaleDateString("pt-BR") : "—"}</td>
                <td className="p-3 text-xs uppercase">{r.source}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" title={r.featured ? "Remover destaque" : "Destacar"}
                      onClick={() => patch.mutate({ id: r.id, changes: { featured: !r.featured } })}>
                      {r.featured ? <StarOff className="w-4 h-4 text-amber-600" /> : <Star className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" title={r.hidden ? "Mostrar" : "Ocultar"}
                      onClick={() => patch.mutate({ id: r.id, changes: { hidden: !r.hidden } })}>
                      {r.hidden ? <EyeOff className="w-4 h-4 text-red-500" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(r)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => confirm(`Excluir avaliação de ${r.author_name}?`) && del.mutate(r.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhuma avaliação encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar avaliação" : "Nova avaliação"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Autor *</Label><Input value={editing.author_name ?? ""} onChange={(e) => setEditing({ ...editing, author_name: e.target.value })} /></div>
                <div>
                  <Label>Nota (0-5)</Label>
                  <Input type="number" step="0.5" min={0} max={5} value={editing.rating ?? 5}
                    onChange={(e) => setEditing({ ...editing, rating: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div><Label>Avatar (URL)</Label><Input value={editing.author_avatar_url ?? ""} onChange={(e) => setEditing({ ...editing, author_avatar_url: e.target.value })} /></div>
              <div><Label>Comentário</Label><Textarea rows={4} value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
              <div><Label>Resposta da loja (opcional)</Label><Textarea rows={2} value={editing.reply ?? ""} onChange={(e) => setEditing({ ...editing, reply: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Data</Label><Input type="date" value={editing.review_date ? editing.review_date.slice(0, 10) : ""} onChange={(e) => setEditing({ ...editing, review_date: e.target.value ? new Date(e.target.value).toISOString() : null })} /></div>
                <div><Label>Fonte</Label>
                  <Select value={editing.source ?? "manual"} onValueChange={(v) => setEditing({ ...editing, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="trustindex">Trustindex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Ordem</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex gap-6 pt-2 border-t">
                <div className="flex items-center gap-2"><Switch checked={editing.featured ?? false} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} /><Label>Destacar</Label></div>
                <div className="flex items-center gap-2"><Switch checked={editing.hidden ?? false} onCheckedChange={(v) => setEditing({ ...editing, hidden: v })} /><Label>Ocultar</Label></div>
              </div>
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

const emptyWidget: Partial<ReviewWidget> = {
  scope: "home", scope_ref: null, layout: "carousel",
  max_items: 6, min_rating: 4, show_average: true, show_cta_badge: true, active: true,
};

function WidgetsTab() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["admin-review-widgets"], queryFn: fetchAllWidgets });
  const [editing, setEditing] = useState<Partial<ReviewWidget> | null>(null);

  const save = useMutation({
    mutationFn: async (f: Partial<ReviewWidget>) => {
      const payload: any = {
        scope: f.scope,
        scope_ref: (f.scope === "home" || f.scope === "global") ? null : (f.scope_ref?.trim() || null),
        layout: f.layout,
        max_items: f.max_items ?? 6,
        min_rating: f.min_rating ?? 4,
        show_average: f.show_average ?? true,
        show_cta_badge: f.show_cta_badge ?? true,
        active: f.active ?? true,
      };
      if (f.id) {
        const { error } = await supabase.from("review_widgets" as any).update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("review_widgets" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-review-widgets"] }); setEditing(null); },
    onError: (e: any) => alert(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("review_widgets" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-review-widgets"] }),
  });

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-neutral-600">Configure onde e como exibir avaliações no site.</p>
        <Button onClick={() => setEditing({ ...emptyWidget })}><Plus className="w-4 h-4 mr-2" /> Novo widget</Button>
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b text-left">
            <tr>
              <th className="p-3">Escopo</th><th className="p-3">Referência</th><th className="p-3">Layout</th>
              <th className="p-3">Itens</th><th className="p-3">Nota mín.</th><th className="p-3">Badge CTA</th>
              <th className="p-3">Status</th><th className="p-3 w-24">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((w) => (
              <tr key={w.id} className="border-b hover:bg-slate-50">
                <td className="p-3 uppercase">{w.scope}</td>
                <td className="p-3 font-mono text-xs">{w.scope_ref ?? "—"}</td>
                <td className="p-3">{w.layout}</td>
                <td className="p-3">{w.max_items}</td>
                <td className="p-3">{w.min_rating}</td>
                <td className="p-3">{w.show_cta_badge ? "Sim" : "Não"}</td>
                <td className="p-3">{w.active ? <span className="text-emerald-600">Ativo</span> : <span className="text-slate-400">Inativo</span>}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(w)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => confirm("Excluir widget?") && del.mutate(w.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Nenhum widget configurado. Um layout padrão será usado.</td></tr>}
          </tbody>
        </table>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar widget" : "Novo widget"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Escopo</Label>
                  <Select value={editing.scope ?? "home"} onValueChange={(v: any) => setEditing({ ...editing, scope: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="category">Categoria (slug)</SelectItem>
                      <SelectItem value="product">Produto (slug)</SelectItem>
                      <SelectItem value="global">Global (todas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Layout</Label>
                  <Select value={editing.layout ?? "carousel"} onValueChange={(v: any) => setEditing({ ...editing, layout: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carousel">Carrossel</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="compact">Compacto</SelectItem>
                      <SelectItem value="badge">Somente badge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(editing.scope === "category" || editing.scope === "product") && (
                <div>
                  <Label>Slug de referência</Label>
                  <Input value={editing.scope_ref ?? ""} placeholder="ex: portas-de-madeira" onChange={(e) => setEditing({ ...editing, scope_ref: e.target.value })} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Máx. itens</Label><Input type="number" value={editing.max_items ?? 6} onChange={(e) => setEditing({ ...editing, max_items: parseInt(e.target.value) || 6 })} /></div>
                <div><Label>Nota mínima</Label><Input type="number" step="0.5" value={editing.min_rating ?? 4} onChange={(e) => setEditing({ ...editing, min_rating: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex flex-wrap gap-6 pt-2 border-t">
                <div className="flex items-center gap-2"><Switch checked={editing.show_average ?? true} onCheckedChange={(v) => setEditing({ ...editing, show_average: v })} /><Label>Mostrar média</Label></div>
                <div className="flex items-center gap-2"><Switch checked={editing.show_cta_badge ?? true} onCheckedChange={(v) => setEditing({ ...editing, show_cta_badge: v })} /><Label>Badge nos CTAs</Label></div>
                <div className="flex items-center gap-2"><Switch checked={editing.active ?? true} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>Ativo</Label></div>
              </div>
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

function SyncTab() {
  const qc = useQueryClient();
  const [widgetId, setWidgetId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sync = async () => {
    setBusy(true); setStatus(null);
    try {
      const res = await fetch(`https://cdn-widgetsrepository.trustindex.io/loader/v2/widget/${encodeURIComponent(widgetId)}/reviews.json`);
      if (!res.ok) throw new Error(`Trustindex respondeu ${res.status}. Verifique o Widget ID.`);
      const json = await res.json().catch(() => null);
      const list: any[] = Array.isArray(json?.reviews) ? json.reviews : Array.isArray(json) ? json : [];
      if (list.length === 0) throw new Error("Nenhuma avaliação encontrada no widget. Confirme o ID ou use importação manual.");
      let imported = 0;
      for (const r of list) {
        const payload: any = {
          source: "trustindex",
          external_id: String(r.id ?? r.review_id ?? `${r.author}-${r.date}`),
          author_name: r.author ?? r.name ?? "Cliente",
          author_avatar_url: r.avatar ?? r.photo ?? null,
          rating: Number(r.rating ?? r.stars ?? 5),
          content: r.text ?? r.content ?? null,
          review_date: r.date ?? r.created_at ?? null,
          language: r.lang ?? null,
          synced_at: new Date().toISOString(),
        };
        const { error } = await supabase.from("reviews" as any).upsert(payload, { onConflict: "source,external_id" } as any);
        if (!error) imported++;
      }
      setStatus(`✅ ${imported} avaliações sincronizadas.`);
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["public-reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews-stats"] });
    } catch (e: any) {
      setStatus(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 max-w-2xl space-y-4">
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2"><RefreshCw className="w-5 h-5" /> Sincronizar do Trustindex</h3>
        <p className="text-sm text-neutral-600">
          Informe o <b>Widget ID</b> do Trustindex que já está integrado ao seu Google.
          Você o encontra em <a className="text-blue-600 underline" href="https://admin.trustindex.io/" target="_blank" rel="noreferrer">admin.trustindex.io</a> → Widgets.
          A sincronização importa/atualiza as avaliações localmente (dedupe pelo ID do review).
        </p>
        <div>
          <Label>Widget ID</Label>
          <Input value={widgetId} onChange={(e) => setWidgetId(e.target.value)} placeholder="ex: 3f2a91b0c4..." />
        </div>
        <Button onClick={sync} disabled={busy || !widgetId.trim()}>
          <RefreshCw className={`w-4 h-4 mr-2 ${busy ? "animate-spin" : ""}`} />
          {busy ? "Sincronizando..." : "Sincronizar agora"}
        </Button>
        {status && <p className="text-sm">{status}</p>}
      </Card>

      <Card className="p-6 text-sm text-neutral-600 space-y-2">
        <p><b>Dica:</b> se o endpoint público do Trustindex mudar, você ainda pode importar avaliações manualmente na aba "Avaliações" ou adicionar seu Widget ID nas Configurações do site.</p>
      </Card>
    </div>
  );
}
