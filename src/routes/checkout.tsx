import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { MessageCircle, ShoppingBag, Trash2, Minus, Plus, ChevronRight, Ticket, X, Check } from "lucide-react";
import {
  fetchProductBySlug, fetchSettings, fetchCouponByCode, validateCoupon, parsePriceBRL,
  type Coupon,
} from "@/lib/site-data";
import { SupabaseImage } from "@/components/SupabaseImage";
import { SiteHeader } from "@/components/SiteHeader";
import {
  addToCart,
  buildQuoteMessage,
  removeFromCart,
  updateQty,
  useCart,
  clearCart,
} from "@/lib/cart";

const searchSchema = z.object({
  slug: z.string().optional(),
  qty: z.coerce.number().int().min(1).optional(),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Orçamento - Lojas Ideal Madeiras" },
      { name: "description", content: "Solicite seu orçamento personalizado na Lojas Ideal Madeiras." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { slug, qty = 1 } = Route.useSearch();
  const navigate = useNavigate();
  const items = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: previewProduct } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => (slug ? fetchProductBySlug(slug) : Promise.resolve(null)),
    enabled: !!slug,
  });

  const whatsapp = (settings?.site.whatsapp || "5511942000000").replace(/\D/g, "");

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + parsePriceBRL(i.price) * i.qty, 0),
    [items]
  );

  const validation = useMemo(
    () => (appliedCoupon ? validateCoupon(appliedCoupon, subtotal) : null),
    [appliedCoupon, subtotal]
  );
  const desconto = validation?.ok ? validation.desconto : 0;
  const total = validation?.ok ? validation.total : subtotal;
  const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const applyCoupon = async () => {
    setCouponError(null);
    try {
      const c = await fetchCouponByCode(couponInput);
      const v = validateCoupon(c, subtotal);
      if (!v.ok) {
        setCouponError(v.error);
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon(c);
    } catch (e: any) {
      setCouponError(e.message || "Erro ao validar cupom.");
    }
  };

  const cartQuoteUrl = useMemo(() => {
    if (items.length === 0) return "";
    const msg = buildQuoteMessage(items, validation?.ok ? {
      coupon: { codigo: validation.coupon.codigo, descricao: validation.coupon.descricao },
      subtotalLabel: brl(subtotal),
      descontoLabel: brl(desconto),
      totalLabel: brl(total),
    } : undefined);
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
  }, [items, whatsapp, validation, subtotal, desconto, total]);

  const previewQuoteUrl = previewProduct
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        `Olá! Gostaria de um orçamento para: ${previewProduct.name} (${qty}x) — ${previewProduct.price}`
      )}`
    : "";

  const handleAddPreviewToBag = () => {
    if (!previewProduct) return;
    addToCart(
      {
        slug: previewProduct.slug,
        name: previewProduct.name,
        price: previewProduct.price,
        image: previewProduct.main_image,
      },
      qty
    );
    navigate({ to: "/checkout" });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />

      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 text-xs text-neutral-600">
          <Link to="/" className="hover:text-[#A7144C]">Início</Link>
          <ChevronRight size={12} />
          <span className="text-neutral-900 font-medium">Solicitar Orçamento</span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          <span className="text-[#A7144C]">SOLICITAR</span> ORÇAMENTO
        </h1>
        <div className="mt-2 h-0.5 w-16 bg-[#A7144C]" />

        {previewProduct && (
          <div className="mt-8 border border-neutral-200 rounded-lg p-4 md:p-6 grid md:grid-cols-[160px_1fr_auto] gap-6 items-center bg-neutral-50">
            <div className="aspect-square bg-white rounded border border-neutral-200 overflow-hidden">
              {previewProduct.main_image && (
                <SupabaseImage src={previewProduct.main_image} alt={previewProduct.name} className="w-full h-full object-contain p-2" />
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#A7144C] font-semibold">Produto selecionado</p>
              <h2 className="text-xl font-bold mt-1">{previewProduct.name}</h2>
              <div className="mt-2 flex items-baseline gap-3">
                {previewProduct.old_price && <span className="text-neutral-400 line-through text-sm">{previewProduct.old_price}</span>}
                <span className="text-2xl font-bold text-[#A7144C]">{previewProduct.price}</span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">Quantidade: {qty}</p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-64">
              <a
                href={previewQuoteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1eb659] text-white px-6 py-3 rounded-full font-semibold text-sm"
              >
                <MessageCircle size={18} /> ORÇAR AGORA
              </a>
              <button
                onClick={handleAddPreviewToBag}
                className="inline-flex items-center justify-center gap-2 bg-[#A7144C] hover:bg-[#8b1140] text-white px-6 py-3 rounded-full font-semibold text-sm"
              >
                <ShoppingBag size={18} /> ADICIONAR NA SACOLA
              </button>
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-bold border-b-2 border-[#A7144C] pb-2 inline-block">
            Sua Sacola ({items.length})
          </h2>

          {items.length === 0 ? (
            <div className="mt-6 text-center py-12 border border-dashed border-neutral-300 rounded-lg text-neutral-500">
              <ShoppingBag size={40} className="mx-auto text-neutral-400" />
              <p className="mt-3">Sua sacola está vazia.</p>
              <Link to="/" className="inline-block mt-4 bg-[#A7144C] text-white px-6 py-3 rounded-full font-semibold text-sm">
                Ver produtos
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-8">
              <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg">
                {items.map((it) => (
                  <li key={it.slug} className="p-4 flex items-center gap-4">
                    <div className="w-20 h-20 bg-neutral-50 rounded border border-neutral-200 overflow-hidden shrink-0">
                      {it.image && <SupabaseImage src={it.image} alt={it.name} className="w-full h-full object-contain p-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to="/produto/$slug" params={{ slug: it.slug }} className="font-medium text-sm hover:text-[#A7144C] line-clamp-2">
                        {it.name}
                      </Link>
                      <div className="mt-1 text-[#A7144C] font-bold">{it.price}</div>
                    </div>
                    <div className="flex items-center border border-neutral-300 rounded-full">
                      <button onClick={() => updateQty(it.slug, it.qty - 1)} className="w-9 h-9 grid place-items-center text-neutral-600 hover:text-[#A7144C]" aria-label="Diminuir">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{it.qty}</span>
                      <button onClick={() => updateQty(it.slug, it.qty + 1)} className="w-9 h-9 grid place-items-center text-neutral-600 hover:text-[#A7144C]" aria-label="Aumentar">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(it.slug)} className="text-neutral-400 hover:text-[#A7144C] p-2" aria-label="Remover">
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>

              <aside className="border border-neutral-200 rounded-lg p-6 h-fit sticky top-24">
                <h3 className="font-bold text-lg">Resumo do Orçamento</h3>
                <p className="text-sm text-neutral-600 mt-2">
                  {items.reduce((s, i) => s + i.qty, 0)} itens na sacola. Envie sua lista pelo WhatsApp
                  para receber um orçamento personalizado com condições de pagamento e frete.
                </p>
                <a
                  href={cartQuoteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1eb659] text-white px-6 py-3 rounded-full font-semibold text-sm"
                >
                  <MessageCircle size={18} /> ORÇAR AGORA
                </a>
                <button
                  onClick={() => clearCart()}
                  className="mt-3 w-full text-sm text-neutral-500 hover:text-[#A7144C]"
                >
                  Esvaziar sacola
                </button>
              </aside>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
