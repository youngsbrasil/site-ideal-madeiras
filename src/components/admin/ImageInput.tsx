import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon } from "lucide-react";
import { SupabaseImage } from "@/components/SupabaseImage";
import { MediaLibraryPicker } from "@/components/admin/MediaLibraryPicker";
import { uploadToLibrary, publicUrl } from "@/lib/media-library";

export function ImageInput({
  value,
  onChange,
  label = "Imagem",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const asset = await uploadToLibrary(file);
      onChange(publicUrl(asset.full_path));
    } catch (err: any) {
      alert("Erro no upload: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex gap-2 flex-wrap">
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cole uma URL ou escolha da biblioteca"
          className="flex-1 min-w-[200px]"
        />
        <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
          <ImageIcon className="w-4 h-4 mr-2" /> Biblioteca
        </Button>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Button type="button" variant="outline" asChild disabled={uploading}>
            <span>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Enviando..." : "Upload"}
            </span>
          </Button>
        </label>
      </div>
      {value && (
        <SupabaseImage src={value} alt="" className="w-32 h-32 object-cover rounded border" />
      )}
      <MediaLibraryPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(asset) => onChange(publicUrl(asset.full_path))}
      />
    </div>
  );
}
