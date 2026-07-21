import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, Copy, Save } from "lucide-react";
import {
  listAssets,
  uploadToLibrary,
  publicUrl,
  updateAsset,
  deleteAsset,
  type MediaAsset,
} from "@/lib/media-library";

export const Route = createFileRoute("/_authenticated/admin/midia")({
  component: MediaPage,
});

function MediaPage() {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaAsset | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setItems(await listAssets({ search: search || undefined }));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const t = setTimeout(refresh, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) await uploadToLibrary(f);
      await refresh();
    } catch (e: any) {
      alert("Erro no upload: " + e.message);
    } finally {
      setUploading(false);
    }
  }

  async function saveMeta() {
    if (!selected) return;
    await updateAsset(selected.id, { alt: selected.alt, tags: selected.tags, folder: selected.folder });
    await refresh();
    alert("Salvo.");
  }

  async function remove() {
    if (!selected) return;
    if (!confirm("Excluir esta imagem? Não é possível desfazer.")) return;
    await deleteAsset(selected);
    setSelected(null);
    await refresh();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Biblioteca de Mídia</h1>
        <label>
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          <Button asChild disabled={uploading}>
            <span>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Enviar imagens
            </span>
          </Button>
        </label>
      </div>

      <Input
        placeholder="Buscar por nome ou alt..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md mb-4"
      />

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="bg-white rounded border p-3 min-h-[400px]">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhuma imagem ainda.</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {items.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={`border rounded overflow-hidden text-left ${
                    selected?.id === a.id ? "ring-2 ring-emerald-500" : "hover:ring-1 hover:ring-slate-300"
                  }`}
                >
                  <div className="aspect-square bg-slate-100">
                    <img
                      src={publicUrl(a.thumb_path || a.full_path)}
                      alt={a.alt ?? a.original_name}
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-1.5 text-xs truncate">{a.original_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="bg-white rounded border p-4">
          {!selected ? (
            <div className="text-slate-500 text-sm">Selecione uma imagem para editar.</div>
          ) : (
            <div className="space-y-3">
              <img
                src={publicUrl(selected.medium_path || selected.full_path)}
                alt={selected.alt ?? selected.original_name}
                className="w-full rounded border"
              />
              <div className="text-xs text-slate-500 break-all">{selected.original_name}</div>
              <div className="text-xs text-slate-500">
                {selected.width}×{selected.height}px · {Math.round((selected.size_bytes ?? 0) / 1024)} KB
              </div>

              <div>
                <label className="text-xs font-medium">Alt (SEO)</label>
                <Input
                  value={selected.alt ?? ""}
                  onChange={(e) => setSelected({ ...selected, alt: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Tags (separadas por vírgula)</label>
                <Input
                  value={selected.tags.join(", ")}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium">Pasta</label>
                <Input
                  value={selected.folder ?? ""}
                  onChange={(e) => setSelected({ ...selected, folder: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={saveMeta}>
                  <Save className="w-4 h-4 mr-1" /> Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl(selected.full_path));
                    alert("URL copiada.");
                  }}
                >
                  <Copy className="w-4 h-4 mr-1" /> Copiar URL
                </Button>
                <Button size="sm" variant="destructive" onClick={remove}>
                  <Trash2 className="w-4 h-4 mr-1" /> Excluir
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
