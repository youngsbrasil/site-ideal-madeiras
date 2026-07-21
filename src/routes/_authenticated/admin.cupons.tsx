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
import { Plus, Pencil, Trash2, Ticket } from "lucide-react";
import { fetchCategories, type Coupon, type Category } from "@/lib/site-data";
import { toLocalInput, fromLocalInput } from "@/lib/datetime";

export const Route = createFileRoute("/_authenticated/admin/cupons")({
  component: CouponsAdmin,
});

async function fetchAllCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase.from("coupons" as any).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Coupon[];
}

const empty: Partial<Coupon> = {
  codigo: "",
  tipo: "percentual",
  valor: 10,
  validade_inicio: null,
  validade_fim: null,
  uso_maximo: null,
  usos_atuais: 0,
  ativo: true,
  categorias_aplicaveis: [],
  valor_minimo_pedido: null,
  descricao: "",
  destacar_no_site: false,
};

function CouponsAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["admin-coupons"], queryFn: fetchAllCoupons });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null);

  const save = useMutation({
    mutationFn: async (f: Partial<Coupon>) => {
      if (!f.codigo?.trim()) throw new Error("Informe o código do cupom.");
      const payload: any = {
        codigo: f.codigo.trim().toUpperCase(),
        tipo: f.tipo,
        valor: Number(f.valor) || 0,
        validade_inicio: f.validade_inicio || null,
        validade_fim: f.validade_fim || null,
        uso_maximo: f.uso_maximo ?? null,
        ativo: f.ativo ?? true,
        categorias_aplicaveis: f.categorias_aplicaveis ?? [],
        valor_minimo_pedido: f.valor_minimo_pedido ?? null,
        descricao: f.descricao || null,
        destacar_no_site: f.destacar_no_site ?? false,
      };
      if (f.id) {
        const { error } = await supabase.from("coupons" as any).update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("coupons" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-coupons"] }); setEditing(null); },
    onError: (e: any) => alert(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Ticket className="w-6 h-6" /> Cupons</h1>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="w-4 h-4 mr-2" /> Novo cupom</Button>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b text-left">
            <tr>
              <th className="p-3">Código</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Validade</th>
              <th className="p-3">Usos</th>
              <th className="p-3">Status</th>
              <th className="p-3 w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-mono font-semibold">{c.codigo}</td>
                <td className="p-3">{c.tipo === "percentual" ? "Percentual" : "Valor fixo"}</td>
                <td className="p-3">{c.tipo === "percentual" ? `${c.valor}%` : Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className="p-3 text-xs">
                  {c.validade_inicio ? new Date(c.validade_inicio).toLocaleString("pt-BR") : "—"}
                  {" → "}
                  {c.validade_fim ? new Date(c.validade_fim).toLocaleString("pt-BR") : "—"}
                </td>
                <td className="p-3">{c.usos_atuais}{c.uso_maximo != null ? ` / ${c.uso_maximo}` : ""}</td>
                <td className="p-3">
                  {c.ativo ? <span className="text-emerald-600">Ativo</span> : <span className="text-slate-400">Inativo</span>}
                  {c.destacar_no_site && <span className="ml-2 text-amber-600">★ Destaque</span>}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(c)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => confirm(`Excluir cupom ${c.codigo}?`) && del.mutate(c.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum cupom cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar cupom" : "Novo cupom"}</DialogTitle></DialogHeader>
          {editing && (
            <CouponForm value={editing} onChange={setEditing} categories={categories} />
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

function CouponForm({
  value, onChange, categories,
}: {
  value: Partial<Coupon>;
  onChange: (v: Partial<Coupon>) => void;
  categories: Category[];
}) {
  const set = (patch: Partial<Coupon>) => onChange({ ...value, ...patch });
  const cats = value.categorias_aplicaveis ?? [];
  const toggleCat = (id: string) => {
    const next = cats.includes(id) ? cats.filter((c) => c !== id) : [...cats, id];
    set({ categorias_aplicaveis: next });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Código *</Label>
          <Input value={value.codigo ?? ""} onChange={(e) => set({ codigo: e.target.value.toUpperCase() })} placeholder="PROMO10" />
        </div>
        <div>
          <Label>Tipo</Label>
          <Select value={value.tipo ?? "percentual"} onValueChange={(v) => set({ tipo: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentual">Percentual (%)</SelectItem>
              <SelectItem value="valor_fixo">Valor fixo (R$)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Valor {value.tipo === "percentual" ? "(%)" : "(R$)"}</Label>
          <Input type="number" step="0.01" value={value.valor ?? ""} onChange={(e) => set({ valor: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <Label>Valor mínimo do pedido (R$)</Label>
          <Input type="number" step="0.01" value={value.valor_minimo_pedido ?? ""} placeholder="Opcional"
            onChange={(e) => set({ valor_minimo_pedido: e.target.value === "" ? null : parseFloat(e.target.value) })} />
        </div>
        <div>
          <Label>Validade — início</Label>
          <Input type="datetime-local" value={toLocalInput(value.validade_inicio)} onChange={(e) => set({ validade_inicio: fromLocalInput(e.target.value) })} />
        </div>
        <div>
          <Label>Validade — fim</Label>
          <Input type="datetime-local" value={toLocalInput(value.validade_fim)} onChange={(e) => set({ validade_fim: fromLocalInput(e.target.value) })} />
        </div>
        <div>
          <Label>Uso máximo</Label>
          <Input type="number" value={value.uso_maximo ?? ""} placeholder="Ilimitado"
            onChange={(e) => set({ uso_maximo: e.target.value === "" ? null : parseInt(e.target.value) || null })} />
        </div>
        <div>
          <Label>Usos atuais</Label>
          <Input type="number" value={value.usos_atuais ?? 0} readOnly disabled />
        </div>
      </div>

      <div>
        <Label>Descrição (mostrada ao cliente)</Label>
        <Textarea rows={2} value={value.descricao ?? ""} onChange={(e) => set({ descricao: e.target.value })} placeholder="Ex: 10% off em portas até domingo" />
      </div>

      <div>
        <Label>Categorias aplicáveis</Label>
        <p className="text-xs text-muted-foreground mb-2">Vazio = aplica em todos os produtos.</p>
        <div className="grid grid-cols-2 gap-1 max-h-48 overflow-auto border rounded p-2">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm py-1 px-2 hover:bg-slate-50 rounded cursor-pointer">
              <input type="checkbox" checked={cats.includes(c.id)} onChange={() => toggleCat(c.id)} />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
        <div className="flex items-center gap-2">
          <Switch checked={value.ativo ?? true} onCheckedChange={(v) => set({ ativo: v })} />
          <Label>Ativo</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={value.destacar_no_site ?? false} onCheckedChange={(v) => set({ destacar_no_site: v })} />
          <Label>Exibir na home</Label>
        </div>
      </div>
    </div>
  );
}
