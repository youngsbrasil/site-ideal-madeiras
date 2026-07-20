import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Search, User, Heart, ShoppingCart, Phone, Mail, MapPin,
  Facebook, Instagram, Truck, CreditCard, ShieldCheck,
  MessageCircle, Star, ChevronRight, ChevronLeft, Image as ImageIcon,
} from "lucide-react";
import {
  fetchCategories, fetchProducts, fetchBanners, fetchSettings, proxyImg,
  type Product, type Banner,
} from "@/lib/site-data";
import { SupabaseImage } from "@/components/SupabaseImage";
import { SiteHeader } from "@/components/SiteHeader";

function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const total = banners.length;

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % total), 5000);
    return () => clearInterval(id);
  }, [total]);

  if (total === 0) return null;
  const go = (n: number) => setIdx((n + total) % total);
  const current = banners[idx];

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="relative overflow-hidden rounded-lg group">
        <a href={current.link_url ?? "#"} className="block">
          <SupabaseImage src={current.image_url} alt={current.title ?? ""} className="w-full h-auto" />
        </a>
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => go(idx - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Próximo"
              onClick={() => go(idx + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ir para banner ${i + 1}`}
                  onClick={() => setIdx(i)}
                  className={`h-2.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white/90"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

const IMG = "https://idealmadeiras.com.br/wp-content/uploads";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lojas Ideal Madeiras — Portas, Janelas, Fechaduras" },
      { name: "description", content: "Loja de Portas, Janelas, Ferragens e Fechaduras em São Paulo. Portas maciças, pivotantes, fechaduras digitais, puxadores, pisos e muito mais." },
      { property: "og:title", content: "Lojas Ideal Madeiras" },
      { property: "og:description", content: "Portas, Janelas, Esquadrias, Pisos e muito mais. Compra segura, entrega rápida e parcelamento." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${IMG}/2024/11/COMPRE-PELO-WHATSAPP.png` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const ambientes = [
  { nome: "Sala de Estar", img: `${IMG}/2024/11/SALA-DE-ESTAR-795x600.webp` },
  { nome: "Cozinha", img: `${IMG}/2024/11/COZINHA-795x600.webp` },
];

const depoimentos = [
  { nome: "Ana Paula", texto: "Atendimento excelente e portas de altíssima qualidade. Entregaram no prazo e tudo perfeito!" },
  { nome: "Carlos Eduardo", texto: "Comprei uma pivotante e o resultado ficou incrível. Recomendo demais a Ideal Madeiras." },
  { nome: "Juliana", texto: "Gisele fez um atendimento nota MIL. Voltarei a comprar com certeza." },
  { nome: "Marcos", texto: "Preços justos, produtos de primeira e uma equipe muito atenciosa. Super indico." },
];

function Home() {
  const { data: categorias = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: produtos = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: banners = [] } = useQuery({ queryKey: ["banners"], queryFn: fetchBanners });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  const destaques = produtos.filter((p) => p.featured);
  const maisVistos = produtos.filter((p) => p.most_viewed);
  const oferta = produtos.find((p) => p.old_price);
  
  const whatsapp = settings?.site.whatsapp || "5511942000000";
  const topbarText = settings?.topbar.texto || "FRETE GRÁTIS PARA TODOS OS PEDIDOS ACIMA DE R$ 150";
  const telefone = settings?.site.telefone || "(11) 4200-0000";
  const email = settings?.site.email || "contato@idealmadeiras.com.br";
  const endereco = settings?.site.endereco || "Av. Exemplo, 1000 — São Paulo/SP";
  const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />


      {/* Hero banner carousel */}
      <HeroCarousel banners={banners} />

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 pb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Truck, t: "Entrega Rápida", s: "Para todo o Brasil" },
          { icon: CreditCard, t: "Parcelamento", s: "Em até 12x sem juros" },
          { icon: ShieldCheck, t: "Compra Segura", s: "Site 100% protegido" },
          { icon: MessageCircle, t: "Atendimento", s: "Consultores especializados" },
        ].map(({ icon: Icon, t, s }) => (
          <div key={t} className="flex items-center gap-3 border border-neutral-200 rounded-lg p-4 hover:border-[#A7144C] transition-colors">
            <Icon className="text-[#A7144C] shrink-0" size={32} />
            <div><div className="font-semibold text-sm">{t}</div><div className="text-xs text-neutral-500">{s}</div></div>
          </div>
        ))}
      </section>

      {/* Categorias */}
      {categorias.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionTitle title="CATEGORIAS" subtitle="Portas, Janelas, Esquadrias, Pisos e muito mais..." />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            {categorias.filter((c) => !c.parent_id).map((c) => (
              <Link key={c.id} to="/categoria/$slug" params={{ slug: c.slug }} className="group text-center block">
                <div className="aspect-square rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 group-hover:border-[#A7144C] transition-all grid place-items-center">
                  {c.image_url ? (
                    <SupabaseImage src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-neutral-300" />
                  )}
                </div>
                <div className="mt-3 font-semibold text-sm tracking-wide">{c.name}</div>
                <div className="text-xs text-neutral-500">{c.product_count} produtos</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produtos em Destaque */}
      {destaques.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <SectionTitle title="PRODUTOS EM DESTAQUE" subtitle="Os mais procurados da nossa loja" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
            {destaques.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {/* Banner duplo ambientes */}
      <section className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-2 gap-5">
        {ambientes.map((a) => (
          <a key={a.nome} href="#" className="relative block overflow-hidden rounded-lg group">
            <img src={proxyImg(a.img)} alt={a.nome} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <div className="text-xs uppercase tracking-widest opacity-90">Inspire-se</div>
              <div className="text-2xl font-bold">{a.nome}</div>
              <div className="mt-2 inline-flex items-center gap-1 text-sm border-b border-white/70 pb-0.5">
                Ver produtos <ChevronRight size={16} />
              </div>
            </div>
          </a>
        ))}
      </section>

      {/* Oferta Incrível */}
      {oferta && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid md:grid-cols-2 gap-8 items-center bg-neutral-50 rounded-xl p-6 md:p-10 border border-neutral-200">
            <div className="relative">
              <span className="absolute top-2 left-2 z-10 bg-[#A7144C] text-white text-xs font-bold px-3 py-1 rounded-full">OFERTA INCRÍVEL</span>
              {oferta.main_image && <SupabaseImage src={oferta.main_image} alt={oferta.name} className="w-full max-w-md mx-auto" />}
            </div>
            <div>
              <p className="text-sm text-[#A7144C] font-semibold uppercase tracking-widest">Este produto está numa Oferta Incrível</p>
              <h3 className="text-3xl font-bold mt-2">{oferta.name}</h3>
              <div className="mt-4 flex items-baseline gap-3">
                {oferta.old_price && <span className="text-neutral-400 line-through">{oferta.old_price}</span>}
                <span className="text-3xl font-bold text-[#A7144C]">{oferta.price}</span>
              </div>
              <Link to={productPath(oferta, categorias) as any} className="mt-6 inline-block bg-[#A7144C] hover:bg-[#8b1140] text-white px-8 py-3 rounded-full font-semibold text-sm tracking-wide transition-colors">
                SOLICITAR ORÇAMENTO
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Mais Vistos */}
      {maisVistos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <SectionTitle title="MAIS VISTOS" subtitle="Este item é o mais popular em nosso Catálogo" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mt-6">
            {maisVistos.map((p) => <ProductCard key={p.id} p={p} compact />)}
          </div>
        </section>
      )}

      {/* Depoimentos */}
      <section className="bg-neutral-50 mt-12 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle title="O QUE DIZEM NOSSOS CLIENTES" subtitle="Publicado em Google" center />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {depoimentos.map((d) => (
              <div key={d.nome} className="bg-white rounded-lg p-6 border border-neutral-200">
                <div className="flex text-yellow-400 mb-3">{[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
                <p className="text-sm text-neutral-700 leading-relaxed">"{d.texto}"</p>
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="font-semibold text-sm">{d.nome}</div>
                  <div className="text-xs text-neutral-500">Publicado em Google</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#A7144C] text-white py-10">
        <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-2xl font-bold">Receba nossas ofertas</h3>
            <p className="text-sm opacity-90 mt-1">Cadastre seu e-mail e ganhe descontos exclusivos.</p>
          </div>
          <form className="flex gap-2">
            <input type="email" placeholder="Seu melhor e-mail" className="flex-1 px-4 py-3 rounded-md text-neutral-900 outline-none" />
            <button className="bg-neutral-900 hover:bg-black px-6 rounded-md font-semibold text-sm">CADASTRAR</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300">
        <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <img src={proxyImg(`${IMG}/2024/11/logo-ideal-madeiras-mobile.png`)} alt="Lojas Ideal Madeiras" className="h-16 w-auto brightness-0 invert mb-4" />
            <p className="text-sm leading-relaxed">Loja de Portas, Janelas, Ferragens e Fechaduras em São Paulo. Qualidade e o melhor atendimento do mercado.</p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 grid place-items-center rounded-full border border-neutral-700 hover:bg-[#A7144C] hover:border-[#A7144C]"><Facebook size={16} /></a>
              <a href="#" className="w-9 h-9 grid place-items-center rounded-full border border-neutral-700 hover:bg-[#A7144C] hover:border-[#A7144C]"><Instagram size={16} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Quem somos</a></li>
              <li><a href="#" className="hover:text-white">Nossas lojas</a></li>
              <li><a href="#" className="hover:text-white">Política de privacidade</a></li>
              <li><a href="#" className="hover:text-white">Trocas e devoluções</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2 text-sm">
              {categorias.map((c) => (
                <li key={c.id}>
                  <Link to="/categoria/$slug" params={{ slug: c.slug }} className="hover:text-white">
                    {c.name.charAt(0) + c.name.slice(1).toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-[#A7144C]" /><span>{endereco}</span></li>
              <li className="flex items-center gap-2"><Phone size={16} className="text-[#A7144C]" /> {telefone}</li>
              <li className="flex items-center gap-2"><Mail size={16} className="text-[#A7144C]" /> {email}</li>
              <li className="flex items-center gap-2"><MessageCircle size={16} className="text-[#A7144C]" /> WhatsApp</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800">
          <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-neutral-500 text-center">
            © {new Date().getFullYear()} Lojas Ideal Madeiras. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#1eb659] text-white rounded-full w-14 h-14 grid place-items-center shadow-lg z-50" aria-label="WhatsApp">
        <MessageCircle size={26} />
      </a>
    </div>
  );
}

function SectionTitle({ title, subtitle, center }: { title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
        <span className="text-[#A7144C]">{title.split(" ")[0]}</span>{" "}
        {title.split(" ").slice(1).join(" ")}
      </h2>
      {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
      <div className={`mt-3 h-0.5 w-16 bg-[#A7144C] ${center ? "mx-auto" : ""}`} />
    </div>
  );
}

function ProductCard({ p, compact }: { p: Product; compact?: boolean }) {
  const { data: categorias = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const to = productPath(p, categorias) as any;
  return (
    <div className="group border border-neutral-200 rounded-lg overflow-hidden bg-white hover:shadow-lg hover:border-[#A7144C]/40 transition-all flex flex-col">
      <Link to={to} className="block">
        <div className="relative aspect-square bg-neutral-50 overflow-hidden">
          {p.main_image && (
            <SupabaseImage src={p.main_image} alt={p.name} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
          )}
          <span aria-label="Adicionar à Lista de Desejos" className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 grid place-items-center text-neutral-600 hover:text-[#A7144C] shadow">
            <Heart size={16} />
          </span>
        </div>
        <div className={`p-4 ${compact ? "text-center" : ""}`}>
          <h3 className={`font-medium text-neutral-800 ${compact ? "text-xs" : "text-sm"} line-clamp-2 min-h-[2.5rem]`}>{p.name}</h3>
          <div className="mt-2 flex text-yellow-400 justify-start">
            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
          </div>
          <div className={`mt-2 font-bold text-[#A7144C] ${compact ? "text-sm" : "text-lg"}`}>{p.price}</div>
        </div>
      </Link>
      <div className="px-4 pb-4 mt-auto">
        <Link to={to} className="block w-full text-center bg-[#A7144C] hover:bg-[#8b1140] text-white text-xs font-semibold py-2.5 rounded-full">
          SOLICITAR ORÇAMENTO
        </Link>
      </div>
    </div>
  );
}
