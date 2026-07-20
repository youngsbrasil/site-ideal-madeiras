import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import type { Product } from "@/lib/site-data";

type Props = {
  product: Product;
  whatsapp: string;
  accent?: string;
  category?: string;
};

export function ProductHoverCard({ product, whatsapp, accent = "#f39200", category }: Props) {
  const cleanPhone = (whatsapp || "5511942000000").replace(/\D/g, "");
  const msg = encodeURIComponent(
    `Olá! Tenho interesse no produto: ${product.name} (${product.price}). Poderia me passar mais informações?`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${msg}`;
  const desc = product.description?.trim();

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-20 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 bg-white border border-neutral-200 rounded-lg shadow-2xl p-4 flex flex-col"
      style={{ minHeight: "100%" }}
    >
      <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-800 line-clamp-2 text-center">
        {product.name}
      </h3>
      {category && (
        <p className="mt-1 text-[10px] uppercase tracking-widest text-neutral-400 text-center">
          {category}
        </p>
      )}
      <div className="mt-2 flex items-baseline gap-2 justify-center">
        {product.old_price && (
          <span className="text-[11px] text-neutral-400 line-through">{product.old_price}</span>
        )}
        <span className="font-bold text-base" style={{ color: accent }}>
          {product.price}
        </span>
      </div>
      {desc && (
        <p className="mt-2 text-[11px] leading-relaxed text-neutral-600 line-clamp-4 text-center">
          {desc}
        </p>
      )}
      <div className="mt-auto pt-3 flex flex-col gap-2">
        <Link
          to="/checkout"
          search={{ slug: product.slug, qty: 1 }}
          className="block w-full text-center text-white text-[11px] font-bold py-2.5 rounded-full uppercase"
          style={{ backgroundColor: accent }}
        >
          Solicitar Orçamento
        </Link>
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1eb659] text-white text-[11px] font-bold py-2.5 rounded-full uppercase"
        >
          <MessageCircle size={14} /> Falar com Vendedor Agora
        </a>
      </div>
    </div>
  );
}
