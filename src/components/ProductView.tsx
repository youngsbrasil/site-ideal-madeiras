import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight, Heart, MessageCircle, Phone, ShieldCheck, Truck,
  CreditCard, Star, Share2, Minus, Plus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchProducts, fetchCategories, productPath,
  formatPriceDisplay, type Product,
} from "@/lib/site-data";
import { useSiteSettings } from "@/routes/__root";

import { SupabaseImage } from "@/components/SupabaseImage";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooterSignature } from "@/components/SiteFooterSignature";

export function ProductView({ product }: { product: Product }) {
  const galeria = product.gallery.length > 0 ? product.gallery : (product.main_image ? [product.main_image] : []);
  const [imgAtiva, setImgAtiva] = useState(galeria[0] ?? "");
  const [qtd, setQtd] = useState(1);

  const settings = useSiteSettings();
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categorias = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const categoria = categorias.find((c) => c.id === product.category_id);
  const categoriaNome = categoria?.name ?? "";
  const whatsapp = (settings?.site?.whatsapp || "").replace(/\D/g, "");
  const telefone = settings?.site.telefone || "";
  const mensagem = encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name} (${formatPriceDisplay(product)}). Poderia me passar mais informações?`);
  const whatsappUrl = whatsapp ? `https://wa.me/${whatsapp}?text=${mensagem}` : null;

  const relacionados = allProducts.filter((p) => p.slug !== product.slug && p.category_id === product.category_id).slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />

      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 text-xs text-neutral-600">
          <Link to="/" className="hover:text-[#A7144C]">Início</Link>
          <ChevronRight size={12} />
          {categoriaNome && (<><span>{categoriaNome}</span><ChevronRight size={12} /></>)}
          <span className="text-neutral-900 font-medium line-clamp-1">{product.name}</span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <div className="border border-neutral-200 rounded-lg bg-neutral-50 aspect-square overflow-hidden">
              {imgAtiva && <SupabaseImage src={imgAtiva} alt={product.name} className="w-full h-full object-contain p-6" />}
            </div>
            {galeria.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {galeria.map((g, i) => (
                  <button key={i} onClick={() => setImgAtiva(g)}
                    className={`border rounded-md overflow-hidden bg-neutral-50 aspect-square transition ${imgAtiva === g ? "border-[#A7144C] ring-2 ring-[#A7144C]/30" : "border-neutral-200 hover:border-[#A7144C]/50"}`}>
                    <SupabaseImage src={g} alt={`${product.name} - imagem ${i + 1}`} className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {categoriaNome && <p className="text-xs uppercase tracking-widest text-[#A7144C] font-semibold">{categoriaNome}</p>}
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.name}</h1>
            <div className="mt-3 flex items-center gap-2">
              {settings?.prova_social?.mostrar_estrelas_pdp && (
                <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
              )}

            </div>

            <div className="mt-5 flex items-baseline gap-3">
              {product.old_price && <span className="text-neutral-400 line-through">{product.old_price}</span>}
              <span className="text-4xl font-bold text-[#A7144C]">{formatPriceDisplay(product)}</span>
            </div>
            {product.availability !== "sob_consulta" && product.availability !== "esgotado" && (
              <p className="text-sm text-neutral-600 mt-1">ou em até 12x sem juros no cartão</p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center border border-neutral-300 rounded-full">
                <button onClick={() => setQtd(Math.max(1, qtd - 1))} className="w-10 h-10 grid place-items-center text-neutral-600 hover:text-[#A7144C]" aria-label="Diminuir"><Minus size={14} /></button>
                <span className="w-8 text-center text-sm font-semibold">{qtd}</span>
                <button onClick={() => setQtd(qtd + 1)} className="w-10 h-10 grid place-items-center text-neutral-600 hover:text-[#A7144C]" aria-label="Aumentar"><Plus size={14} /></button>
              </div>
              <Link to="/checkout" search={{ slug: product.slug, qty: qtd }} className="flex-1 text-center bg-[#A7144C] hover:bg-[#8b1140] text-white px-6 py-3 rounded-full font-semibold text-sm">SOLICITAR ORÇAMENTO</Link>
            </div>

            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1eb659] text-white px-6 py-3 rounded-full font-semibold text-sm">
                <MessageCircle size={18} /> Falar com um vendedor no WhatsApp
              </a>
            )}

            <div className="mt-4 flex items-center gap-4 text-sm text-neutral-600">
              <button className="inline-flex items-center gap-2 hover:text-[#A7144C]"><Heart size={16} /> Lista de desejos</button>
              <button className="inline-flex items-center gap-2 hover:text-[#A7144C]"><Share2 size={16} /> Compartilhar</button>
            </div>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <li className="flex items-center gap-2 border border-neutral-200 rounded-md p-3"><Truck size={18} className="text-[#A7144C]" /><span>Consulte condições de frete</span></li>
              <li className="flex items-center gap-2 border border-neutral-200 rounded-md p-3"><CreditCard size={18} className="text-[#A7144C]" /><span>Parcelamento em até 12x</span></li>
              <li className="flex items-center gap-2 border border-neutral-200 rounded-md p-3"><ShieldCheck size={18} className="text-[#A7144C]" /><span>Compra 100% segura</span></li>
            </ul>

            <div className="mt-6 flex items-center gap-3 text-sm"><Phone size={16} className="text-[#A7144C]" /><span>Dúvidas? {telefone}</span></div>
          </div>
        </div>

        {(product.description || product.specifications.length > 0) && (
          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {product.description && (
              <div className="md:col-span-2">
                <h2 className="text-xl font-bold border-b-2 border-[#A7144C] pb-2 inline-block">Descrição do Produto</h2>
                <p className="mt-4 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">{product.description}</p>
              </div>
            )}
            {product.specifications.length > 0 && (
              <div>
                <h2 className="text-xl font-bold border-b-2 border-[#A7144C] pb-2 inline-block">Especificações</h2>
                <dl className="mt-4 divide-y divide-neutral-200 border border-neutral-200 rounded-md">
                  {product.specifications.map((e, i) => (
                    <div key={i} className="flex justify-between px-4 py-2 text-sm">
                      <dt className="text-neutral-500">{e.label}</dt>
                      <dd className="font-medium text-neutral-900 text-right">{e.valor}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}

        {relacionados.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold"><span className="text-[#A7144C]">PRODUTOS</span> RELACIONADOS</h2>
            <div className="mt-3 h-0.5 w-16 bg-[#A7144C]" />
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-5">
              {relacionados.map((p) => (
                <Link key={p.id} to={productPath(p, categorias) as any} className="group border border-neutral-200 rounded-lg overflow-hidden bg-white hover:shadow-lg hover:border-[#A7144C]/40 transition-all">
                  <div className="aspect-square bg-neutral-50 overflow-hidden">
                    {p.main_image && <SupabaseImage src={p.main_image} alt={p.name} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform" />}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                    <div className="mt-2 font-bold text-[#A7144C]">{p.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
      <SiteFooterSignature />
    </div>
  );
}
