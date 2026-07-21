import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Tags, Image as ImageIcon, DownloadCloud, Undo2, AlertTriangle } from "lucide-react";
import { runWpImport, listImportLogs, listSnapshots, restoreSnapshot } from "@/lib/wp-import.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data, refetch } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [p, c, b] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("banners").select("id", { count: "exact", head: true }),
      ]);
      return { produtos: p.count ?? 0, categorias: c.count ?? 0, banners: b.count ?? 0 };
    },
  });

  const cards = [
    { label: "Produtos", value: data?.produtos ?? "-", icon: Package, to: "/admin/produtos", color: "bg-emerald-600" },
    { label: "Categorias", value: data?.categorias ?? "-", icon: Tags, to: "/admin/categorias", color: "bg-blue-600" },
    { label: "Banners", value: data?.banners ?? "-", icon: ImageIcon, to: "/admin/banners", color: "bg-amber-600" },
  ];

  const importFn = useServerFn(runWpImport);
  const restoreFn = useServerFn(restoreSnapshot);
  const logsFn = useServerFn(listImportLogs);
  const snapsFn = useServerFn(listSnapshots);

  const logsQ = useQuery({ queryKey: ["import-logs"], queryFn: () => logsFn() });
  const snapsQ = useQuery({ queryKey: ["import-snapshots"], queryFn: () => snapsFn() });

  const [mode, setMode] = useState<"upsert" | "destructive">("upsert");
  const [confirm, setConfirm] = useState("");
  const [restoreConfirm, setRestoreConfirm] = useState("");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const runImport = async () => {
    setBusy(true); setStatus("Executando...");
    try {
      const r: any = await importFn({ data: { mode, confirm: mode === "destructive" ? confirm : undefined } });
      const parts = [
        r.created ? `${r.created} criados` : null,
        r.updated ? `${r.updated} atualizados` : null,
        r.removed ? `${r.removed} removidos` : null,
      ].filter(Boolean).join(" · ");
      setStatus(`✅ ${mode === "destructive" ? "Modo destrutivo" : "Upsert"}: ${parts || "sem mudanças"}.`);
      setConfirm("");
      refetch();
      logsQ.refetch();
      snapsQ.refetch();
    } catch (e: any) {
      setStatus("❌ Erro: " + (e?.message ?? String(e)));
    } finally {
      setBusy(false);
    }
  };

  const runRestore = async (snapshotId?: string) => {
    setBusy(true); setStatus("Restaurando...");
    try {
      const r: any = await restoreFn({ data: { snapshotId, confirm: restoreConfirm } });
      setStatus(`✅ Restaurados ${r.restored} produtos (removidos ${r.removed}). Snapshot pré-restauração salvo.`);
      setRestoreConfirm("");
      refetch();
      logsQ.refetch();
      snapsQ.refetch();
    } catch (e: any) {
      setStatus("❌ Erro: " + (e?.message ?? String(e)));
    } finally {
      setBusy(false);
    }
  };

  const canRunDestructive = mode === "upsert" || confirm === "APAGAR";

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Painel</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link to={c.to} key={c.label}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">{c.label}</div>
                    <div className="text-3xl font-bold mt-1">{c.value}</div>
                  </div>
                  <div className={`${c.color} p-3 rounded-lg text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <DownloadCloud className="w-5 h-5" /> Importação do XML WordPress
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              O modo padrão é <strong>Upsert por slug</strong>: cria produtos novos e atualiza os existentes sem apagar nada.
              O modo <strong>Destrutivo</strong> apaga todos os produtos atuais antes de importar (um snapshot é salvo automaticamente).
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <label className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer ${mode === "upsert" ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}>
            <input type="radio" name="mode" checked={mode === "upsert"} onChange={() => { setMode("upsert"); setConfirm(""); }} />
            <div>
              <div className="font-medium text-sm">Upsert por slug (seguro)</div>
              <div className="text-xs text-muted-foreground">Não apaga produtos existentes.</div>
            </div>
          </label>
          <label className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer ${mode === "destructive" ? "border-red-500 bg-red-50" : "border-slate-200"}`}>
            <input type="radio" name="mode" checked={mode === "destructive"} onChange={() => setMode("destructive")} />
            <div>
              <div className="font-medium text-sm flex items-center gap-1 text-red-700"><AlertTriangle className="w-4 h-4" /> Destrutivo</div>
              <div className="text-xs text-muted-foreground">Apaga todos os produtos antes de importar.</div>
            </div>
          </label>
        </div>

        {mode === "destructive" && (
          <div className="mt-3 p-3 border border-red-200 bg-red-50 rounded space-y-2">
            <div className="text-sm text-red-800">
              Para confirmar, digite <code className="px-1 bg-white border rounded">APAGAR</code> no campo abaixo:
            </div>
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Digite APAGAR"
              className="max-w-xs"
            />
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button onClick={runImport} disabled={busy || !canRunDestructive} variant={mode === "destructive" ? "destructive" : "default"}>
            {busy ? "Executando..." : mode === "destructive" ? "Executar importação destrutiva" : "Executar importação (upsert)"}
          </Button>
        </div>
        {status && <div className="mt-3 text-sm">{status}</div>}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold flex items-center gap-2"><Undo2 className="w-5 h-5" /> Restaurar snapshot</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Snapshots são criados automaticamente antes de qualquer operação destrutiva. Restaurar substitui o catálogo atual pelo snapshot escolhido (um novo snapshot do estado atual é salvo antes).
        </p>

        <div className="mt-3 flex items-end gap-2 flex-wrap">
          <div>
            <label className="block text-xs mb-1">Digite APAGAR para habilitar</label>
            <Input value={restoreConfirm} onChange={(e) => setRestoreConfirm(e.target.value)} placeholder="APAGAR" className="max-w-xs" />
          </div>
          <Button
            variant="outline"
            disabled={busy || restoreConfirm !== "APAGAR" || (snapsQ.data ?? []).length === 0}
            onClick={() => runRestore()}
          >
            Restaurar último snapshot
          </Button>
        </div>

        <div className="mt-4 border rounded overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-2">Data</th>
                <th className="p-2">Motivo</th>
                <th className="p-2">Itens</th>
                <th className="p-2 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {(snapsQ.data ?? []).map((s: any) => (
                <tr key={s.snapshot_id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="p-2 text-xs text-muted-foreground">{s.reason ?? "—"}</td>
                  <td className="p-2">{s.count}</td>
                  <td className="p-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy || restoreConfirm !== "APAGAR"}
                      onClick={() => runRestore(s.snapshot_id)}
                    >
                      Restaurar
                    </Button>
                  </td>
                </tr>
              ))}
              {(snapsQ.data ?? []).length === 0 && (
                <tr><td colSpan={4} className="p-3 text-center text-muted-foreground">Nenhum snapshot ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold">Últimas importações</h2>
        <div className="mt-3 border rounded overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-2">Data</th>
                <th className="p-2">Usuário</th>
                <th className="p-2">Modo</th>
                <th className="p-2">Fonte</th>
                <th className="p-2">Criados</th>
                <th className="p-2">Atualizados</th>
                <th className="p-2">Removidos</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(logsQ.data ?? []).map((l: any) => (
                <tr key={l.id} className="border-t">
                  <td className="p-2 whitespace-nowrap text-xs">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="p-2 text-xs">{l.user_email ?? "—"}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${l.mode === "destructive" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                      {l.mode}
                    </span>
                  </td>
                  <td className="p-2 text-xs">{l.source}</td>
                  <td className="p-2">{l.created_count}</td>
                  <td className="p-2">{l.updated_count}</td>
                  <td className="p-2">{l.removed_count}</td>
                  <td className="p-2">
                    {l.status === "success"
                      ? <span className="text-emerald-700 text-xs">✅ ok</span>
                      : <span className="text-red-700 text-xs" title={l.error}>❌ erro</span>}
                  </td>
                </tr>
              ))}
              {(logsQ.data ?? []).length === 0 && (
                <tr><td colSpan={8} className="p-3 text-center text-muted-foreground">Sem execuções ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-sm text-muted-foreground">
        Bem-vindo ao painel administrativo. Use o menu lateral para gerenciar o conteúdo do site.
      </div>
    </div>
  );
}
