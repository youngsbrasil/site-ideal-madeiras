import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Ticket, Copy, Check } from "lucide-react";
import { fetchFeaturedCoupons } from "@/lib/site-data";

export function CouponStrip() {
  const { data: coupons = [] } = useQuery({ queryKey: ["featured-coupons"], queryFn: fetchFeaturedCoupons });
  const [copied, setCopied] = useState<string | null>(null);

  if (coupons.length === 0) return null;

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="bg-gradient-to-r from-[#A7144C] to-[#7d0d38] text-white">
      <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center justify-center gap-3 text-sm">
        <Ticket className="w-4 h-4 shrink-0" />
        <span className="font-semibold uppercase tracking-wide">Cupons ativos:</span>
        {coupons.map((c) => (
          <button
            key={c.id}
            onClick={() => copy(c.codigo)}
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 border-dashed px-3 py-1 rounded-full transition"
            title={c.descricao ?? "Copiar cupom"}
          >
            <span className="font-mono font-bold">{c.codigo}</span>
            <span className="text-xs opacity-90">
              {c.tipo === "percentual" ? `${c.valor}% off` : `${Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} off`}
            </span>
            {copied === c.codigo ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 opacity-70" />}
          </button>
        ))}
      </div>
    </div>
  );
}
