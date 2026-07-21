import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchRedirects, type Redirect } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, Download, ArrowRight } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: SeoAdmin,
});

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth
Disallow: /checkout
Disallow: /_build/

Sitemap: ${SITE_URL}/sitemap.xml
`;

type Form = Partial<Redirect>;
const empty: Form = { url_origem: "", url_destino: "", tipo: 301, ativo: true };

function SeoAdmin() {
  const qc = useQueryClient();
  const { data: redirects = [] } = useQuery({ queryKey: ["redirects-admin"], queryFn: fetchRedirects });
  const [editing, setEditing] = useState<Form | null>(null);
  const [robots, setRobots] = useState<string>("");
  const [loadedRobots, setLoadedRobots] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "robots").maybeSingle();
      const v: any = data?.value;
      setRobots(v?.content || DEFAULT_ROBOTS);
      setLoadedRobots(true);
    })();
  }, []);

  const save = useMutation({
    mutationFn: async (f: Form) => {
      const payload: any = {
        url_origem: normalizePath(f.url_origem ?? ""),
        url_destino: f.url_destino,
        tipo: f.tipo ?? 301,
        ativo: f.ativo ?? true,
      };
      if (f.id) {
        const { error } = await supabase.from("redirects" as any).update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("redirects" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["redirects-admin"] });
      setEditing(null);
    },
    onError: (e: any) => alert(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("redirects" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["redirects-admin"] }),
  });

  const saveRobots = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "robots", value: { content: robots } as any });
      if (error) throw error;
    },
    onSuccess: () => alert("robots.txt salvo!"),
    onError: (e: any) => alert(e.message),
  });

  async function onCsvImport(file: File) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const rows: any[] = [];
    for (const line of lines) {
      const parts = line.split(/[,;\t]/).map((s) => s.trim().replace(/^"|"$/g, ""));
      if (parts.length < 2) continue;
      const de = parts[0];
      const para = parts[1];
      if (!de || !para) continue;
      if (/^(url_origem|de|from|source)$/i.test(de)) continue; // header row
      rows.push({
        url_origem: normalizePath(de),
        url_destino: para,
        tipo: 301,
        ativo: true,
      });
    }
    if (rows.length === 0) {
      alert("Nenhuma linha válida encontrada. Formato esperado: de,para");
      return;
    }
    const { error } = await supabase.from("redirects" as any).upsert(rows, { onConflict: "url_origem" });
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ["redirects-admin"] });
    alert(`${rows.length} redirects importados.`);
  }

  function exportCsv() {
    const header = "de,para,tipo,ativo,hits";
    const rows = redirects.map(
      (r) => `${r.url_origem},${r.url_destino},${r.tipo},${r.ativo ? 1 : 0},${r.hits}`,
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "redirects.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-2">SEO & Redirects</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Gerencie redirects 301/302 de URLs antigas do WordPress, robots.txt e visão geral de SEO técnico.
      </p>

      {/* REDIRECTS */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-semibold text-lg">Redirects 301 / 302</h2>
            <p className="text-xs text-muted-foreground">
              Mapeie <code>/produto-antigo/</code> → <code>/nova-url</code>. Rodam antes do render.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onCsvImport(e.target.files[0])}
              />
              <span className="inline-flex items-center gap-2 text-sm border rounded-md px-3 h-9 bg-white hover:bg-slate-50">
                <Upload className="w-4 h-4" /> Importar CSV
              </span>
            </label>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-2" /> Exportar CSV
            </Button>
            <Button onClick={() => setEditing({ ...empty })}>
              <Plus className="w-4 h-4 mr-2" /> Novo redirect
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          Formato do CSV: <code>de,para</code> (uma linha por redirect). Cabeçalho opcional.
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b text-left">
              <tr>
                <th className="p-2">Origem</th>
                <th className="p-2"></th>
                <th className="p-2">Destino</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Ativo</th>
                <th className="p-2">Hits</th>
                <th className="p-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="p-2 font-mono text-xs">{r.url_origem}</td>
                  <td className="p-2"><ArrowRight className="w-3 h-3 text-muted-foreground" /></td>
                  <td className="p-2 font-mono text-xs">{r.url_destino}</td>
                  <td className="p-2">{r.tipo}</td>
                  <td className="p-2">{r.ativo ? "✅" : "—"}</td>
                  <td className="p-2 tabular-nums">{r.hits}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => confirm(`Excluir redirect ${r.url_origem}?`) && del.mutate(r.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {redirects.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    Nenhum redirect cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ROBOTS.TXT */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-lg">robots.txt</h2>
            <p className="text-xs text-muted-foreground">
              Servido em <code>/robots.txt</code>. Cache 10 min.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRobots(DEFAULT_ROBOTS)}>Restaurar padrão</Button>
            <Button onClick={() => saveRobots.mutate()} disabled={saveRobots.isPending || !loadedRobots}>
              {saveRobots.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
        <Textarea
          rows={12}
          value={robots}
          onChange={(e) => setRobots(e.target.value)}
          className="font-mono text-xs"
        />
      </Card>

      {/* SEO OVERVIEW */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-3">Dados estruturados & Sitemap</h2>
        <ul className="text-sm space-y-2 text-muted-foreground">
          <li>
            ✅ <strong>Sitemap XML automático:</strong>{" "}
            <a href="/sitemap.xml" target="_blank" className="text-blue-600 underline">
              /sitemap.xml
            </a>{" "}
            (produtos + categorias ativos, atualizado a cada 30 min).
          </li>
          <li>
            ✅ <strong>robots.txt:</strong>{" "}
            <a href="/robots.txt" target="_blank" className="text-blue-600 underline">
              /robots.txt
            </a>
          </li>
          <li>✅ <strong>Product JSON-LD</strong> injetado em cada página de produto (name, image, price BRL, availability).</li>
          <li>✅ <strong>BreadcrumbList JSON-LD</strong> nas páginas de categoria e produto.</li>
          <li>✅ <strong>LocalBusiness JSON-LD</strong> com as 3 lojas do Brás no <code>__root</code>.</li>
          <li>✅ <strong>Meta tags por página:</strong> edite em cada produto/categoria (aba SEO no formulário). Fallback automático: <code>{"{nome} | Ideal Madeiras"}</code>.</li>
          <li>✅ <strong>Middleware de redirects</strong> ativo — responde 301/302 antes do render.</li>
        </ul>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar redirect" : "Novo redirect"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>URL de origem (caminho antigo)</Label>
                <Input
                  placeholder="/produto/porta-antiga"
                  value={editing.url_origem ?? ""}
                  onChange={(e) => setEditing({ ...editing, url_origem: e.target.value })}
                />
              </div>
              <div>
                <Label>URL de destino</Label>
                <Input
                  placeholder="/portas/porta-nova ou https://…"
                  value={editing.url_destino ?? ""}
                  onChange={(e) => setEditing({ ...editing, url_destino: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <select
                    className="w-full h-10 border rounded-md px-3 bg-background text-sm"
                    value={editing.tipo ?? 301}
                    onChange={(e) => setEditing({ ...editing, tipo: parseInt(e.target.value) })}
                  >
                    <option value={301}>301 - Permanente</option>
                    <option value={302}>302 - Temporário</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <Switch
                    checked={editing.ativo ?? true}
                    onCheckedChange={(v) => setEditing({ ...editing, ativo: v })}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
            </div>
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

function normalizePath(p: string): string {
  const s = p.trim();
  if (!s) return "/";
  if (/^https?:\/\//i.test(s)) return s;
  const withSlash = s.startsWith("/") ? s : "/" + s;
  return withSlash.length > 1 && withSlash.endsWith("/") ? withSlash.slice(0, -1) : withSlash;
}
