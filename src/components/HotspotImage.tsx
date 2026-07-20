import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { fetchHotspots } from "@/lib/hotspots";
import { fetchProducts, fetchSettings, proxyImg } from "@/lib/site-data";
import { SupabaseImage } from "@/components/SupabaseImage";

type Props = {
  imageKey: string;
  src: string;
  alt?: string;
  className?: string;
  accent?: string;
};

export function HotspotImage({ imageKey, src, alt = "", className, accent = "#f39200" }: Props) {
  const { data: pins = [] } = useQuery({
    queryKey: ["hotspots", imageKey],
    queryFn: () => fetchHotspots(imageKey),
  });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const phone = (settings?.site.whatsapp || "5511942000000").replace(/\D/g, "");

  const active = pins.filter((p) => p.active && p.product_id);

  const isSupabase = /supabase\.co/.test(src);

  return (
    <div className={`relative overflow-hidden rounded-lg ${className ?? ""}`}>
      {isSupabase ? (
        <SupabaseImage src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <img src={proxyImg(src)} alt={alt} className="w-full h-full object-cover" />
      )}

      {active.map((pin) => {
        const product = products.find((p) => p.id === pin.product_id);
        if (!product) return null;
        const msg = encodeURIComponent(
          `Olá! Tenho interesse no produto: ${product.name} (${product.price}). Poderia me passar mais informações?`,
        );
        return (
          <div
            key={pin.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 group/pin z-10"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            {/* Pin button with pulsing ring */}
            <button
              type="button"
              aria-label={product.name}
              className="relative flex items-center justify-center w-6 h-6 rounded-full text-white shadow-lg ring-2 ring-white transition-transform hover:scale-110"
              style={{ backgroundColor: accent }}
            >
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: accent }}
              />
              <span className="relative w-2 h-2 rounded-full bg-white" />
            </button>

            {/* Popup on hover */}
            <div className="pointer-events-none opacity-0 translate-y-1 group-hover/pin:opacity-100 group-hover/pin:translate-y-0 group-hover/pin:pointer-events-auto transition-all duration-200 absolute left-1/2 -translate-x-1/2 top-8 w-64 bg-white rounded-lg shadow-2xl border border-neutral-200 p-3 z-20">
              <div className="flex gap-3">
                {product.main_image && (
                  <div className="w-16 h-16 shrink-0 bg-neutral-50 rounded overflow-hidden">
                    <SupabaseImage src={product.main_image} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-800 line-clamp-2">
                    {pin.label || product.name}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    {product.old_price && (
                      <span className="text-[10px] text-neutral-400 line-through">{product.old_price}</span>
                    )}
                    <span className="font-bold text-sm" style={{ color: accent }}>
                      {product.price}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                <Link
                  to="/checkout"
                  search={{ slug: product.slug, qty: 1 }}
                  className="block w-full text-center text-white text-[10px] font-bold py-2 rounded-full uppercase"
                  style={{ backgroundColor: accent }}
                >
                  Solicitar Orçamento
                </Link>
                <a
                  href={`https://wa.me/${phone}?text=${msg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full bg-[#25D366] hover:bg-[#1eb659] text-white text-[10px] font-bold py-2 rounded-full uppercase"
                >
                  <MessageCircle size={12} /> Falar com Vendedor
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
