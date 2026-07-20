import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Package, Tags, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Painel</h1>
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
      <div className="mt-8 text-sm text-muted-foreground">
        Bem-vindo ao painel administrativo. Use o menu lateral para gerenciar o conteúdo do site.
      </div>
    </div>
  );
}
