import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Rss } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/feeds")({
  component: FeedsAdmin,
});

type Feed = {
  name: string;
  desc: string;
  path: string;
  where: string;
};

const feeds: Feed[] = [
  {
    name: "Meta / Facebook / Instagram (CSV)",
    desc: "Feed CSV para o Catálogo do Meta Commerce Manager. Use em Data Feeds → Fonte de dados → URL agendada.",
    path: "/api/public/feed/meta.csv",
    where: "business.facebook.com → Commerce Manager → Catálogo → Fontes de dados",
  },
  {
    name: "Google Shopping (XML)",
    desc: "Feed RSS 2.0 com namespace g: para Google Merchant Center. Recomendado para o Google.",
    path: "/api/public/feed/google.xml",
    where: "merchants.google.com → Produtos → Feeds → Adicionar feed → Busca agendada",
  },
  {
    name: "Google Shopping (TSV)",
    desc: "Alternativa em formato tabular (separado por tabulação) aceito pelo Google Merchant Center.",
    path: "/api/public/feed/google.csv",
    where: "merchants.google.com → Feeds → Busca agendada (formato TSV)",
  },
];

function FeedsAdmin() {
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Rss className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Feeds de Produtos</h1>
          <p className="text-sm text-muted-foreground">
            URLs públicas para conectar seu catálogo ao Meta, Google Shopping e outras plataformas.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {feeds.map((f) => {
          const url = `${origin}${f.path}`;
          return (
            <Card key={f.path} className="p-5">
              <div className="font-semibold text-lg">{f.name}</div>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              <div className="mt-3 flex items-center gap-2 bg-slate-50 border rounded px-3 py-2 font-mono text-xs break-all">
                {url}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => copy(url)}>
                  <Copy className="w-4 h-4 mr-2" />
                  {copied === url ? "Copiado!" : "Copiar URL"}
                </Button>
                <a href={f.path} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" /> Abrir feed
                  </Button>
                </a>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <strong>Onde configurar:</strong> {f.where}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 mt-6 bg-amber-50 border-amber-200">
        <div className="font-semibold mb-2">Dicas importantes</div>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
          <li>Apenas produtos <strong>ativos</strong> com <strong>imagem principal</strong> e <strong>preço válido</strong> entram no feed.</li>
          <li>Preencha o campo <strong>“Preço numérico”</strong> no cadastro para garantir precisão. Caso vazio, o sistema tenta extrair da string.</li>
          <li>Se houver <strong>preço antigo</strong>, ele é enviado como preço regular e o preço atual vira <em>sale_price</em>.</li>
          <li>Configure a plataforma para <strong>rebuscar o feed 1x por dia</strong> (as respostas são cacheadas por 30min).</li>
        </ul>
      </Card>
    </div>
  );
}
