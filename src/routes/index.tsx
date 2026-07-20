import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Heart, Phone, Mail, MapPin, Facebook, Instagram,
  MessageCircle, Star, ChevronRight, ChevronLeft, Image as ImageIcon,
  Truck, CreditCard, ShieldCheck, Eye, MapPin as MapPinIcon,
} from "lucide-react";
import {
  fetchCategories, fetchProducts, fetchBanners, fetchSettings, proxyImg,
  type Product, type Banner,
} from "@/lib/site-data";
import { SupabaseImage } from "@/components/SupabaseImage";
import { SiteHeader } from "@/components/SiteHeader";

const IMG = "https://idealmadeiras.com.br/wp-content/uploads";

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
    <section className="relative">
      <div className="relative overflow-hidden group">
        <a href={current.link_url ?? "#"} className="block">
          <SupabaseImage src={current.image_url} alt={current.title ?? ""} className="w-full h-auto max-h-[520px] object-cover" />
        </a>
        {total > 1 && (
          <>
            <button type="button" aria-label="Anterior" onClick={() => go(idx - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 shadow">
              <ChevronLeft size={22} />
            </button>
            <button type="button" aria-label="Próximo" onClick={() => go(idx + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 shadow">
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {banners.map((_, i) => (
                <button key={i} type="button" aria-label={`banner ${i + 1}`} onClick={() => setIdx(i)}
                  className={`h-2.5 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white/90"}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

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

const ambientes = {
  sala: `${IMG}/2024/11/SALA-DE-ESTAR-795x600.webp`,
  cozinha: `${IMG}/2024/11/COZINHA-795x600.webp`,
};

const depoimentos = [
  { nome: "Anderson Vieira", texto: "A Ideal Madeiras é um ótimo lugar para comprar os primeiros portas da minha casa. Tive ótimas orientações...", data: "1 ano atrás" },
  { nome: "Eliana Sampaio", texto: "Segunda vez que faço compras de portas nesta loja, nunca mudaram o atendimento, sempre nos atenderam bem e...", data: "1 ano atrás" },
  { nome: "Sandra Karito", texto: "Gisele fez um atendimento nota MIL.", data: "1 ano atrás" },
];

const dicas = [
  { titulo: "Como manter o acabamento de suas Portas em perfeito estado", img: `${IMG}/2024/11/COMO-MANTER-ACABAMENTO.webp` },
  { titulo: "Formas de Lubrificar Janelas e Venezianas de forma eficiente e sem perdas", img: `${IMG}/2024/11/LUBRIFICAR-JANELAS.webp` },
];

function Home() {
  const { data: categorias = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: produtos = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: banners = [] } = useQuery({ queryKey: ["banners"], queryFn: fetchBanners });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  const catById = Object.fromEntries(categorias.map((c) => [c.id, c]));
  const destaques = produtos.filter((p) => p.featured).slice(0, 5);
  const outros = produtos.filter((p) => !p.featured).slice(0, 8);
  const maisPopular = produtos.find((p) => p.most_viewed) ?? produtos[0];
  const oferta = produtos.find((p) => p.old_price) ?? produtos[1];
  const especiais = produtos.slice(0, 4);
  const especiaisLinha2 = produtos.slice(4, 8);

  const whatsapp = settings?.site.whatsapp || "5511942000000";
  const telefone = settings?.site.telefone || "(11) 4200-0000";
  const email = settings?.site.email || "contato@idealmadeiras.com.br";
  const endereco = settings?.site.endereco || "Av. Exemplo, 1000 — São Paulo/SP";
  const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />

      <HeroCarousel banners={banners} />

      {/* Benefits row */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: MessageCircle, t: "COMPRE PELO WHATSAPP", s: "Clique aqui e fale agora mesmo", color: "bg-[#25D366]" },
            { icon: Truck, t: "ENTREGA SUPER RÁPIDA", s: "Rapidez e garantia até você", color: "bg-[#A7144C]" },
            { icon: CreditCard, t: "10x PARCELAMENTO DIRETO", s: "Venda na loja e parcele em 10x", color: "bg-[#A7144C]" },
            { icon: ShieldCheck, t: "COMPRA 100% SEGURA", s: "Alto nível de segurança de site", color: "bg-[#A7144C]" },
          ].map(({ icon: Icon, t, s, color }) => (
            <div key={t} className="flex items-center gap-3">
              <div className={`${color} text-white w-11 h-11 rounded-full grid place-items-center shrink-0`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="text-[11px] font-bold leading-tight">{t}</div>
                <div className="text-[11px] text-neutral-500">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIAS - rounded square tiles */}
      {categorias.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionTitle title="CATEGORIAS" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-6">
            {categorias.filter((c) => !c.parent_id).slice(0, 6).map((c) => (
              <Link key={c.id} to="/categoria/$slug" params={{ slug: c.slug }} className="group text-center block">
                <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 group-hover:border-[#A7144C] transition-all grid place-items-center p-4">
                  {c.image_url ? (
                    <SupabaseImage src={c.image_url} alt={c.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-neutral-300" />
                  )}
                </div>
                <div className="mt-3 font-bold text-xs tracking-wider uppercase">{c.name}</div>
                <div className="text-[11px] text-neutral-500">{c.product_count} produtos</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PRODUTOS EM DESTAQUE with OFERTA badges */}
      {destaques.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <SectionTitle title="PRODUTOS EM DESTAQUE" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
            {destaques.map((p) => <ProductCard key={p.id} p={p} category={catById[p.category_id ?? ""]?.name} showBadge />)}
          </div>
        </section>
      )}

      {/* Veja aqui alguns dos nossos produtos */}
      {outros.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold">
              Veja Aqui <span className="text-[#A7144C]">Alguns dos Nossos Produtos</span>
            </h2>
            <p className="text-sm text-neutral-500 mt-1">Portas, Janelas, Esquadrias, Pisos e muito mais...</p>
            <div className="mt-3 h-0.5 w-16 bg-[#A7144C] mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {outros.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} category={catById[p.category_id ?? ""]?.name} />)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {outros.slice(4, 8).map((p) => <ProductCard key={p.id} p={p} category={catById[p.category_id ?? ""]?.name} />)}
          </div>
        </section>
      )}

      {/* Google reviews style testimonials */}
      <section className="bg-neutral-50 py-10">
        <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-4 gap-5 items-center">
          <div className="text-center">
            <div className="font-bold text-lg">Excelente</div>
            <div className="flex text-yellow-400 justify-center my-1">{[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}</div>
            <div className="text-xs text-neutral-500">Com base em 84 avaliações</div>
            <div className="mt-2 text-xs font-bold text-blue-600">Google</div>
          </div>
          {depoimentos.map((d) => (
            <div key={d.nome} className="bg-white rounded-lg p-5 border border-neutral-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-neutral-200 grid place-items-center text-xs font-bold">{d.nome[0]}</div>
                <div>
                  <div className="font-semibold text-sm">{d.nome}</div>
                  <div className="text-[10px] text-neutral-500">{d.data}</div>
                </div>
                <div className="ml-auto text-[10px] font-bold text-blue-600">G</div>
              </div>
              <div className="flex text-yellow-400 mb-2">{[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}</div>
              <p className="text-xs text-neutral-700 leading-relaxed line-clamp-4">{d.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* O MAIS POPULAR - big ambient + side product */}
      {maisPopular && (
        <section className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative overflow-hidden rounded-lg">
            <img src={proxyImg(ambientes.sala)} alt="Sala" className="w-full h-full object-cover min-h-[420px]" />
          </div>
          <div className="bg-neutral-50 rounded-lg p-6 flex flex-col">
            <SectionTitle title="O MAIS POPULAR" />
            <p className="text-xs text-neutral-500 mt-3">Este item é o mais popular em nosso Catálogo</p>
            {maisPopular.main_image && (
              <div className="my-6 grid place-items-center">
                <SupabaseImage src={maisPopular.main_image} alt={maisPopular.name} className="max-h-48 object-contain" />
              </div>
            )}
            <div className="text-center font-medium text-sm">{maisPopular.name}</div>
            <div className="text-center text-xs text-neutral-500 mt-1">{catById[maisPopular.category_id ?? ""]?.name}</div>
            <Link to="/produto/$slug" params={{ slug: maisPopular.slug }} className="mt-4 mx-auto inline-flex items-center gap-2 border border-neutral-800 text-neutral-800 hover:bg-neutral-800 hover:text-white text-xs font-bold px-6 py-2 rounded-full uppercase transition-colors">
              <Eye size={14} /> Quick View
            </Link>
            <button className="mt-3 mx-auto inline-flex items-center gap-2 text-xs text-neutral-600 hover:text-[#A7144C]">
              <Heart size={14} /> Adicionar à Lista de Desejos
            </button>
          </div>
        </section>
      )}

      {/* OFERTA INCRÍVEL */}
      {oferta && (
        <section className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-3 gap-6">
          <div className="bg-neutral-50 rounded-lg p-6 flex flex-col">
            <SectionTitle title="OFERTA INCRÍVEL" />
            <p className="text-xs text-neutral-500 mt-3">Este produto está numa Oferta Incrível</p>
            {oferta.main_image && (
              <div className="my-6 grid place-items-center">
                <SupabaseImage src={oferta.main_image} alt={oferta.name} className="max-h-48 object-contain" />
              </div>
            )}
            <div className="text-center font-medium text-sm">{oferta.name}</div>
            <div className="text-center text-xs text-neutral-500 mt-1">{catById[oferta.category_id ?? ""]?.name}</div>
            <Link to="/produto/$slug" params={{ slug: oferta.slug }} className="mt-4 mx-auto inline-flex items-center gap-2 border border-neutral-800 text-neutral-800 hover:bg-neutral-800 hover:text-white text-xs font-bold px-6 py-2 rounded-full uppercase transition-colors">
              <Eye size={14} /> Quick View
            </Link>
            <button className="mt-3 mx-auto inline-flex items-center gap-2 text-xs text-neutral-600 hover:text-[#A7144C]">
              <Heart size={14} /> Adicionar à Lista de Desejos
            </button>
          </div>
          <div className="md:col-span-2 relative overflow-hidden rounded-lg">
            <img src={proxyImg(ambientes.cozinha)} alt="Cozinha" className="w-full h-full object-cover min-h-[420px]" />
          </div>
        </section>
      )}

      {/* APRENDA COM A IDEAL - 2 tips cards */}
      <section className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-2 gap-5">
        {dicas.map((d) => (
          <a key={d.titulo} href="#" className="relative flex items-stretch bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 hover:border-[#A7144C] transition-colors group">
            <div className="p-6 flex-1">
              <div className="text-[10px] font-bold tracking-widest text-[#A7144C]">APRENDA COM A IDEAL</div>
              <div className="mt-2 font-bold text-base leading-snug">{d.titulo}</div>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold border-b border-neutral-800 pb-0.5">LEIA MAIS</div>
            </div>
            <img src={proxyImg(d.img)} alt="" className="w-40 md:w-52 object-cover group-hover:scale-105 transition-transform duration-500" />
          </a>
        ))}
      </section>

      {/* OFERTAS ESPECIAIS with tabs */}
      <section className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-4 gap-5">
        <div className="bg-[#f4efe6] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-neutral-500">DICAS IMPORTANTES</div>
            <div className="mt-3 font-bold text-lg leading-snug">25 Ideias para Comprar a Porta Certa para sua Casa ou Escritório</div>
          </div>
          <div className="mt-4 text-xs text-neutral-500">Aprenda como escolher bem</div>
        </div>
        <div className="md:col-span-3">
          <div className="flex items-end justify-between border-b border-neutral-200 pb-2">
            <h2 className="text-lg font-bold uppercase"><span className="text-[#A7144C]">Ofertas</span> Especiais</h2>
            <div className="flex gap-4 text-xs font-semibold uppercase">
              <button className="border-b-2 border-[#A7144C] pb-1 text-[#A7144C]">Novos</button>
              <button className="text-neutral-500 hover:text-neutral-800 pb-1">Indicados</button>
              <button className="text-neutral-500 hover:text-neutral-800 pb-1">Campeões de vendas</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {especiais.map((p) => <ProductCard key={p.id} p={p} category={catById[p.category_id ?? ""]?.name} compact />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 grid md:grid-cols-4 gap-5">
        <div className="bg-[#f4efe6] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-neutral-500">DICAS IMPORTANTES</div>
            <div className="mt-3 font-bold text-lg leading-snug">15 Tipos de Madeiras que darão Charme e Requinte para sua Casa ou Escritório</div>
          </div>
        </div>
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {especiaisLinha2.map((p) => <ProductCard key={p.id} p={p} category={catById[p.category_id ?? ""]?.name} compact />)}
        </div>
      </section>

      {/* CONHEÇA AS NOSSAS LOJAS */}
      <section className="relative py-16 bg-neutral-900 text-white text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600')] bg-cover bg-center" />
        <div className="relative">
          <h3 className="text-2xl md:text-3xl font-bold">CONHEÇA AS NOSSAS LOJAS</h3>
          <a href="#lojas" className="inline-block mt-4 bg-[#A7144C] hover:bg-[#8b1140] text-white text-xs font-bold px-6 py-3 rounded-full uppercase">Clique Aqui</a>
        </div>
      </section>

      {/* Instagram feed placeholder */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 grid place-items-center text-white">
            <Instagram size={26} />
          </div>
          <div className="font-bold mt-2">idealmadeiras.oficial</div>
          <div className="text-xs text-neutral-500">907 posts &middot; 2.5K followers</div>
          <a href="https://instagram.com/idealmadeiras.oficial" target="_blank" rel="noopener" className="inline-block mt-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-5 py-1.5 rounded">Follow</a>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map((i) => (
            <a key={i} href="#" className="block aspect-square bg-neutral-100 rounded overflow-hidden border border-neutral-200">
              <img src={proxyImg(`${IMG}/2024/11/insta-${i}.webp`)} onError={(e)=>((e.target as HTMLImageElement).style.opacity="0.3")} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </a>
          ))}
        </div>
      </section>

      {/* Newsletter - yellow bar */}
      <section className="bg-[#f4c542] text-neutral-900 py-6">
        <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-4 items-center">
          <div className="flex items-center gap-3">
            <Mail size={28} />
            <div>
              <div className="font-bold">Receba nossas novidades primeiro!</div>
              <div className="text-xs">Cadastre seu e-mail e receba ofertas e descontos exclusivos!</div>
            </div>
          </div>
          <form className="flex gap-2">
            <input type="email" placeholder="Seu melhor e-mail" className="flex-1 px-4 py-2.5 rounded-md text-neutral-900 bg-white outline-none border border-neutral-300" />
            <button className="bg-neutral-900 hover:bg-black text-white px-6 rounded-md font-bold text-xs uppercase">Cadastrar</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0b1a34] text-neutral-300">
        <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <img src={proxyImg(`${IMG}/2024/11/logo-ideal-madeiras-mobile.png`)} alt="Lojas Ideal Madeiras" className="h-16 w-auto mb-4" />
            <p className="text-sm leading-relaxed">A Maior Loja de Portas, Janelas e Pisos de Madeira da Rua do Gasômetro. Venha conferir nossa Show Room e conhecer a maior estrutura de madeiras da região.</p>
            <a href={whatsappHref} target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1eb659] text-white text-xs font-bold px-4 py-2 rounded uppercase">
              <MessageCircle size={14} /> Compre pelo WhatsApp Aqui
            </a>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 grid place-items-center rounded-full border border-neutral-700 hover:bg-[#A7144C] hover:border-[#A7144C]"><Facebook size={16} /></a>
              <a href="#" className="w-9 h-9 grid place-items-center rounded-full border border-neutral-700 hover:bg-[#A7144C] hover:border-[#A7144C]"><Instagram size={16} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Menu Principal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Sobre a Ideal Madeiras</a></li>
              <li><a href="#" className="hover:text-white">Nossas Lojas</a></li>
              <li><a href="#" className="hover:text-white">Formas de Pagamento</a></li>
              <li><a href="#" className="hover:text-white">Segurança e Privacidade</a></li>
              <li><a href="#" className="hover:text-white">Trocas e Devoluções</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Atendimento</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Fale Conosco</a></li>
              <li><a href="#" className="hover:text-white">Meus Pedidos</a></li>
              <li><a href="#" className="hover:text-white">Cadastre-se</a></li>
              <li className="flex items-center gap-2 pt-2"><Phone size={14} className="text-[#A7144C]" /> {telefone}</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-[#A7144C]" /> {email}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Lojas</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <div className="font-bold text-white">Loja 1</div>
                <div className="flex items-start gap-2 mt-1"><MapPinIcon size={14} className="mt-0.5 text-[#A7144C]" /><span>{endereco}</span></div>
                <div className="flex items-center gap-2 mt-1"><Phone size={14} className="text-[#A7144C]" /> {telefone}</div>
              </li>
              <li>
                <div className="font-bold text-white">Loja 2</div>
                <div className="flex items-start gap-2 mt-1"><MapPin size={14} className="mt-0.5 text-[#A7144C]" /><span>Rua do Gasômetro, 284 — São Paulo/SP</span></div>
              </li>
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

function SectionTitle({ title }: { title: string }) {
  const parts = title.split(" ");
  return (
    <div>
      <h2 className="text-lg md:text-xl font-bold tracking-tight uppercase">
        <span className="text-[#A7144C]">{parts[0]}</span>{" "}
        {parts.slice(1).join(" ")}
      </h2>
      <div className="mt-2 h-0.5 w-12 bg-[#A7144C]" />
    </div>
  );
}

function ProductCard({ p, category, compact, showBadge }: { p: Product; category?: string; compact?: boolean; showBadge?: boolean }) {
  return (
    <div className="group border border-neutral-200 rounded-lg overflow-hidden bg-white hover:shadow-lg hover:border-[#A7144C]/40 transition-all flex flex-col relative">
      {showBadge && p.old_price && (
        <span className="absolute top-2 left-2 z-10 bg-[#A7144C] text-white text-[10px] font-bold px-2 py-1 rounded">OFERTA</span>
      )}
      <Link to="/produto/$slug" params={{ slug: p.slug }} className="block">
        <div className="relative aspect-square bg-neutral-50 overflow-hidden">
          {p.main_image && (
            <SupabaseImage src={p.main_image} alt={p.name} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
          )}
          <span aria-label="Lista de Desejos" className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 grid place-items-center text-neutral-600 hover:text-[#A7144C] shadow">
            <Heart size={14} />
          </span>
        </div>
        <div className={`p-3 ${compact ? "text-center" : ""}`}>
          <h3 className={`font-medium text-neutral-800 text-xs line-clamp-2 min-h-[2rem]`}>{p.name}</h3>
          {category && <div className="mt-1 text-[10px] text-neutral-500 uppercase tracking-wider">{category}</div>}
          <div className="mt-2 font-bold text-[#A7144C] text-sm">{p.price}</div>
        </div>
      </Link>
      <div className="px-3 pb-3 mt-auto">
        <Link to="/checkout" search={{ slug: p.slug, qty: 1 }} className="block w-full text-center bg-[#A7144C] hover:bg-[#8b1140] text-white text-[10px] font-bold py-2 rounded-full uppercase">
          Solicitar Orçamento
        </Link>
      </div>
    </div>
  );
}
