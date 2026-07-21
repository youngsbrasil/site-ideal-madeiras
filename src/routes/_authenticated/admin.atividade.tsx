import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/atividade")({
  component: ActivityLog,
});

function ActivityLog() {
  const [filter, setFilter] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["activity-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (data ?? []).filter((r: any) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return [r.user_email, r.action, r.entity_type, r.entity_id].some((v) => (v ?? "").toString().toLowerCase().includes(q));
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Log de Atividades</h1>
      <Input placeholder="Filtrar por email, ação, entidade…" value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-md" />
      <div className="bg-white rounded border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Quando</th>
              <th className="p-3">Usuário</th>
              <th className="p-3">Ação</th>
              <th className="p-3">Entidade</th>
              <th className="p-3">ID</th>
              <th className="p-3">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-4 text-center">Carregando…</td></tr>}
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-t align-top">
                <td className="p-3 text-xs text-slate-500 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3">{r.user_email ?? "—"}</td>
                <td className="p-3 font-mono text-xs">{r.action}</td>
                <td className="p-3">{r.entity_type}</td>
                <td className="p-3 font-mono text-xs">{r.entity_id ?? "—"}</td>
                <td className="p-3 text-xs"><pre className="whitespace-pre-wrap">{r.details ? JSON.stringify(r.details, null, 0) : ""}</pre></td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-slate-500">Nenhum registro.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
