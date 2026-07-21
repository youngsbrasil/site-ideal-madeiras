import { supabase } from "@/integrations/supabase/client";

export type MediaAsset = {
  id: string;
  bucket: string;
  folder: string | null;
  original_name: string;
  mime_type: string;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  full_path: string;
  medium_path: string | null;
  thumb_path: string | null;
  alt: string | null;
  tags: string[];
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

const SIZES = { thumb: 400, medium: 1024, full: 1920 } as const;
type SizeKey = keyof typeof SIZES;

async function readImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Falha ao ler a imagem"));
      img.src = url;
    });
    return img;
  } finally {
    // revoke later — image already decoded
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function drawToWebp(img: HTMLImageElement, maxSide: number, quality = 0.82): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D não disponível");
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao gerar WebP"))), "image/webp", quality);
  });
}

export async function uploadToLibrary(file: File, opts?: { folder?: string; alt?: string; tags?: string[] }): Promise<MediaAsset> {
  if (!file.type.startsWith("image/")) throw new Error("Apenas imagens são aceitas na biblioteca.");
  const img = await readImage(file);
  const id = crypto.randomUUID();
  const folder = opts?.folder ?? "library";
  const base = `${folder}/${id}`;

  const variants: Record<SizeKey, string> = { thumb: "", medium: "", full: "" };
  for (const key of Object.keys(SIZES) as SizeKey[]) {
    const blob = await drawToWebp(img, SIZES[key]);
    const path = `${base}/${key}.webp`;
    const { error } = await supabase.storage.from("media").upload(path, blob, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw error;
    variants[key] = path;
  }

  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("media_assets" as any)
    .insert({
      bucket: "media",
      folder,
      original_name: file.name,
      mime_type: "image/webp",
      size_bytes: file.size,
      width: img.naturalWidth,
      height: img.naturalHeight,
      full_path: variants.full,
      medium_path: variants.medium,
      thumb_path: variants.thumb,
      alt: opts?.alt ?? null,
      tags: opts?.tags ?? [],
      uploaded_by: userData.user?.id ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as MediaAsset;
}

export function publicUrl(path: string | null | undefined): string {
  if (!path) return "";
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

export function assetSrcSet(a: MediaAsset): string {
  const parts: string[] = [];
  if (a.thumb_path) parts.push(`${publicUrl(a.thumb_path)} 400w`);
  if (a.medium_path) parts.push(`${publicUrl(a.medium_path)} 1024w`);
  if (a.full_path) parts.push(`${publicUrl(a.full_path)} 1920w`);
  return parts.join(", ");
}

export async function listAssets(opts?: { search?: string; folder?: string; limit?: number }): Promise<MediaAsset[]> {
  let q: any = supabase.from("media_assets" as any).select("*").order("created_at", { ascending: false });
  if (opts?.folder) q = q.eq("folder", opts.folder);
  if (opts?.search) {
    const s = `%${opts.search}%`;
    q = q.or(`original_name.ilike.${s},alt.ilike.${s}`);
  }
  q = q.limit(opts?.limit ?? 200);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as MediaAsset[];
}

export async function updateAsset(id: string, patch: Partial<Pick<MediaAsset, "alt" | "tags" | "folder">>): Promise<void> {
  const { error } = await supabase.from("media_assets" as any).update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteAsset(a: MediaAsset): Promise<void> {
  const paths = [a.full_path, a.medium_path, a.thumb_path].filter(Boolean) as string[];
  if (paths.length) await supabase.storage.from("media").remove(paths);
  const { error } = await supabase.from("media_assets" as any).delete().eq("id", a.id);
  if (error) throw error;
}
