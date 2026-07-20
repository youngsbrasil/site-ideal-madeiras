import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const [site, setSite] = useState<any>({});
  const [topbar, setTopbar] = useState<any>({});

  useEffect(() => {
    if (data) { setSite(data.site); setTopbar(data.topbar); }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error: e1 } = await supabase.from("site_settings").upsert({ key: "site", value: site });
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("site_settings").upsert({ key: "topbar", value: topbar });
      if (e2) throw e2;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings"] }); alert("Configurações salvas!"); },
    onError: (e: any) => alert(e.message),
  });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Configurações do site</h1>

      <Card className="p-6 space-y-4 mb-4">
        <h2 className="font-semibold text-lg">Informações gerais</h2>
        <div><Label>Nome da loja</Label><Input value={site.nome ?? ""} onChange={(e) => setSite({ ...site, nome: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>WhatsApp (só números com DDI)</Label><Input value={site.whatsapp ?? ""} onChange={(e) => setSite({ ...site, whatsapp: e.target.value })} placeholder="5511999999999" /></div>
          <div><Label>Telefone</Label><Input value={site.telefone ?? ""} onChange={(e) => setSite({ ...site, telefone: e.target.value })} /></div>
        </div>
        <div><Label>E-mail</Label><Input value={site.email ?? ""} onChange={(e) => setSite({ ...site, email: e.target.value })} /></div>
        <div><Label>Endereço</Label><Input value={site.endereco ?? ""} onChange={(e) => setSite({ ...site, endereco: e.target.value })} /></div>
      </Card>

      <Card className="p-6 space-y-4 mb-4">
        <h2 className="font-semibold text-lg">Barra superior</h2>
        <div><Label>Texto promocional</Label><Input value={topbar.texto ?? ""} onChange={(e) => setTopbar({ ...topbar, texto: e.target.value })} /></div>
      </Card>

      <Button onClick={() => save.mutate()} disabled={save.isPending} size="lg">
        {save.isPending ? "Salvando..." : "Salvar configurações"}
      </Button>
    </div>
  );
}
