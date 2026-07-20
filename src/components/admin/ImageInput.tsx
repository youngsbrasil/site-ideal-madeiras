import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Link as LinkIcon } from "lucide-react";

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

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err: any) {
      alert("Erro no upload: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex gap-2">
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cole uma URL ou envie um arquivo"
          className="flex-1"
        />
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
        <img src={value} alt="" className="w-32 h-32 object-cover rounded border" />
      )}
    </div>
  );
}
