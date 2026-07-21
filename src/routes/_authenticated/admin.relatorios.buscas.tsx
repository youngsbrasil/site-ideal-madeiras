import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/relatorios/buscas")({
  component: SearchReports,
});

type Row = { term_normalized: string; total: number; last_term: string; results_count: number };

async function fetchAgg(days: number, zeroOnly: boolean): Promise<Row[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  let q = supabase
    .from("search_log")
    .select("term,term_normalized,results_count,created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(5000);
  if (zeroOnly) q = q.eq("results_count", 0);
  const { data, error } = await q;
  if (error) throw error;
  const map = new Map<string, Row>();
  for (const r of (data ?? []) as any[]) {
    const key = r.term_normalized;
    const cur = map.get(key);
    if (cur) {
      cur.total += 1;
      cur.results_count = r.results_count;
    } else {
      map.set(key, { term_normalized: key, total: 1, last_term: r.term, results_count: r.results_count });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 100);
}

function SearchReports() {
  const [days, setDays] = useState(30);
  const { data: top = [], isLoading: l1 } = useQuery({
    queryKey: ["report-top", days],
    queryFn: () => fetchAgg(days, false),
  });
  const { data: zero = [], isLoading: l2 } = useQuery({
    queryKey: ["report-zero", days],
    queryFn: () => fetchAgg(days, true),
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Search className="w-6 h-6" /> Relatório de Buscas</h1>
          <p className="text-sm text-slate-500">Termos digitados no site — revela demanda e lacunas de catálogo.</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Button key={d} variant={days === d ? "default" : "outline"} size="sm" onClick={() => setDays(d)}>
              {d} dias
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="w-4 h-4 text-emerald-600" /> Termos mais buscados</CardTitle>
          </CardHeader>
          <CardContent>
            {l1 ? <p className="text-sm text-slate-500">Carregando…</p> : top.length === 0 ? (
              <p className="text-sm text-slate-500">Sem buscas no período.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-slate-500 border-b">
                  <tr><th className="py-2">Termo</th><th className="py-2 text-right">Buscas</th><th className="py-2 text-right">Últ. resultados</th></tr>
                </thead>
                <tbody>
                  {top.map((r) => (
                    <tr key={r.term_normalized} className="border-b last:border-0">
                      <td className="py-2">{r.last_term}</td>
                      <td className="py-2 text-right font-semibold">{r.total}</td>
                      <td className="py-2 text-right text-slate-500">{r.results_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><AlertCircle className="w-4 h-4 text-amber-600" /> Buscas sem resultado</CardTitle>
          </CardHeader>
          <CardContent>
            {l2 ? <p className="text-sm text-slate-500">Carregando…</p> : zero.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma busca sem resultado 🎉</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-slate-500 border-b">
                  <tr><th className="py-2">Termo</th><th className="py-2 text-right">Ocorrências</th></tr>
                </thead>
                <tbody>
                  {zero.map((r) => (
                    <tr key={r.term_normalized} className="border-b last:border-0">
                      <td className="py-2">{r.last_term}</td>
                      <td className="py-2 text-right font-semibold text-amber-700">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
