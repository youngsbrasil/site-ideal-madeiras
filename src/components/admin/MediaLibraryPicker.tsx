import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listAssets, uploadToLibrary, publicUrl, type MediaAsset } from "@/lib/media-library";
import { Loader2, Upload } from "lucide-react";

export function MediaLibraryPicker({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (asset: MediaAsset) => void;
}) {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setItems(await listAssets({ search: search || undefined }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(refresh, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, search]);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Biblioteca de Mídia</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 items-center">
          <Input placeholder="Buscar por nome ou alt..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button type="button" variant="outline" asChild disabled={uploading}>
              <span>
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Enviar
              </span>
            </Button>
          </label>
        </div>
        <div className="flex-1 overflow-auto mt-3">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhuma imagem. Envie a primeira acima.</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {items.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    onSelect(a);
                    onOpenChange(false);
                  }}
                  className="group border rounded overflow-hidden hover:ring-2 hover:ring-emerald-500 text-left"
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
      </DialogContent>
    </Dialog>
  );
}
