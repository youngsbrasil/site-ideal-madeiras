import { supabase } from "@/integrations/supabase/client";

export type Hotspot = {
  id: string;
  image_key: string;
  x: number;
  y: number;
  product_id: string | null;
  label: string | null;
  sort_order: number;
  active: boolean;
};

export const HOTSPOT_SLOTS: { key: string; label: string }[] = [
  { key: "home_popular", label: "Home — Ambiente 'O Mais Popular' (sala)" },
  { key: "home_oferta", label: "Home — Ambiente 'Oferta Incrível' (cozinha)" },
];

export async function fetchHotspots(imageKey?: string): Promise<Hotspot[]> {
  let q = supabase.from("hotspots").select("*").order("sort_order");
  if (imageKey) q = q.eq("image_key", imageKey);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Hotspot[];
}
