import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchHotspots, HOTSPOT_SLOTS, type Hotspot } from "@/lib/hotspots";
import { fetchProducts, proxyImg } from "@/lib/site-data";
import { SupabaseImage } from "@/components/SupabaseImage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/hotspots")({
  component: HotspotsAdmin,
});

// Default images for each home slot (matches src/routes/index.tsx).
const SLOT_DEFAULT_IMAGE: Record<string, string> = {
  home_popular: "https://idealmadeiras.com.br/wp-content/uploads/2024/11/SALA-DE-ESTAR-795x600.webp",
  home_oferta: "https://idealmadeiras.com.br/wp-content/uploads/2024/11/COZINHA-795x600.webp",
};

function HotspotsAdmin() {
  const [slot, setSlot] = useState(HOTSPOT_SLOTS[0].key);
  const qc = useQueryClient();

  const { data: pins = [], refetch } = useQuery({
    queryKey: ["hotspots", slot],
    queryFn: () => fetchHotspots(slot),
  });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const imgRef = useRef<HTMLDivElement>(null);
  const [placing, setPlacing] = useState(false);

  const invalidate = () => {
    refetch();
    qc.invalidateQueries({ queryKey: ["hotspots"] });
  };

  async function addPin(e: React.MouseEvent<HTMLDivElement>) {
    if (!placing || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const { error } = await supabase.from("hotspots").insert({
      image_key: slot,
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      sort_order: pins.length,
      active: true,
    });
    if (error) return alert(error.message);
    setPlacing(false);
    invalidate();
  }

  async function updatePin(pin: Hotspot, patch: Partial<Hotspot>) {
    const { error } = await supabase.from("hotspots").update(patch).eq("id", pin.id);
    if (error) return alert(error.message);
    invalidate();
  }

  async function removePin(pin: Hotspot) {
    if (!confirm("Remover este pin?")) return;
    const { error } = await supabase.from("hotspots").delete().eq("id", pin.id);
    if (error) return alert(error.message);
    invalidate();
  }

  const imgSrc = SLOT_DEFAULT_IMAGE[slot] ?? "";

  const productOptions = useMemo(
    () => products.map((p) => ({ id: p.id, name: p.name })),
    [products],
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pins interativos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Marque produtos sobre imagens do site. Ao passar o mouse no pin, um popup do produto abre.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold">Imagem:</label>
        <select
          className="border rounded px-3 py-2 text-sm bg-white"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
        >
          {HOTSPOT_SLOTS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <Button onClick={() => setPlacing((v) => !v)} variant={placing ? "secondary" : "default"}>
          <Plus className="w-4 h-4 mr-1" />
          {placing ? "Clique na imagem para posicionar…" : "Adicionar pin"}
        </Button>
      </div>

      <Card className="p-3">
        <div
          ref={imgRef}
          onClick={addPin}
          className={`relative w-full max-w-3xl mx-auto select-none ${placing ? "cursor-crosshair" : ""}`}
        >
          {imgSrc && (
            <img src={proxyImg(imgSrc)} alt="" className="w-full h-auto rounded" draggable={false} />
          )}
          {pins.map((pin) => {
            const product = products.find((p) => p.id === pin.product_id);
            return (
              <div
                key={pin.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <div className="relative w-6 h-6 rounded-full bg-[#f39200] ring-2 ring-white shadow flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-[#f39200] animate-ping opacity-70" />
                  <span className="relative text-[10px] font-bold text-white">
                    {pins.indexOf(pin) + 1}
                  </span>
                </div>
                {product && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-8 whitespace-nowrap bg-black/80 text-white text-[10px] px-2 py-0.5 rounded">
                    {product.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Pins nesta imagem ({pins.length})</h2>
        {pins.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum pin. Clique em “Adicionar pin” e depois na imagem.</p>
        )}
        <div className="space-y-2">
          {pins.map((pin, i) => (
            <div key={pin.id} className="grid grid-cols-1 md:grid-cols-[auto_1fr_120px_120px_auto_auto] gap-2 items-center border rounded p-2">
              <span className="text-xs font-bold w-6 h-6 rounded-full bg-[#f39200] text-white grid place-items-center">{i + 1}</span>
              <select
                className="border rounded px-2 py-1.5 text-sm bg-white"
                value={pin.product_id ?? ""}
                onChange={(e) => updatePin(pin, { product_id: e.target.value || null })}
              >
                <option value="">— Selecione o produto —</option>
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.1"
                className="border rounded px-2 py-1.5 text-sm"
                value={pin.x}
                onChange={(e) => updatePin(pin, { x: Number(e.target.value) })}
                aria-label="X (%)"
              />
              <input
                type="number"
                step="0.1"
                className="border rounded px-2 py-1.5 text-sm"
                value={pin.y}
                onChange={(e) => updatePin(pin, { y: Number(e.target.value) })}
                aria-label="Y (%)"
              />
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={pin.active}
                  onChange={(e) => updatePin(pin, { active: e.target.checked })}
                />
                Ativo
              </label>
              <Button variant="ghost" size="sm" onClick={() => removePin(pin)}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
