import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Heart, Phone, Mail, MapPin,
  Facebook, Instagram, MessageCircle, Star,
  ChevronRight, ChevronLeft, Image as ImageIcon,
  Truck, CreditCard, ShieldCheck, Clock,
} from "lucide-react";
import {
  fetchCategories, fetchProducts, fetchBanners, fetchSettings, proxyImg,
  type Product, type Banner,
} from "@/lib/site-data";
import { SupabaseImage } from "@/components/SupabaseImage";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductHoverCard } from "@/components/ProductHoverCard";
import { HotspotImage } from "@/components/HotspotImage";

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
    <section className="relative bg-[#0b1a34]">
      <div className="relative overflow-hidden group">
        <a href={current.link_url ?? "#"} className="block">
          <SupabaseImage src={current.image_url} alt={current.title ?? ""} className="w-full h-auto object-cover max-h-[520px] mx-auto" />
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
                <button key={i} type="button" aria-label={`Ir para banner ${i + 1}`} onClick={() => setIdx(i)}
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

const depoimentos = [
  { nome: "Anderson Vieira", texto: "A Ideal Madeiras é um ótimo lugar para comprar os primeiros portais da minha casa. Tive ótimas orientações..." },
  { nome: "Eliana Sampaio", texto: "Segunda vez que faço compras de portas nessa loja, nunca mudaram o atendimento, sempre nos atenderam bem e nos entregaram tudo perfeito." },
  { nome: "Sandra Karita", texto: "Gisele fez um atendimento nota MIL. Voltarei a comprar com certeza." },
];

const aprendaBanners = [
  { titulo: "Como manter o acabamento de suas Portas em perfeito estado", img: `${IMG}/2024/11/COMO-MANTER-795x600.webp` },
  { titulo: "Formas de Lubrificar Janelas e Venezianas de forma eficiente e sem perdas", img: `${IMG}/2024/11/LUBRIFICAR-795x600.webp` },
];

function Home() {
  const { data: categorias = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: produtos = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: banners = [] } = useQuery({ queryKey: ["banners"], queryFn: fetchBanners });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  const destaques = produtos.filter((p) => p.featured).slice(0, 5);
  const maisPopular = produtos.find((p) => p.most_viewed) || produtos[0];
  const oferta = produtos.find((p) => p.old_price);
  const outrosProdutos = useMemo(() => produtos.slice(0, 12), [produtos]);
  const ofertasEspeciais = useMemo(() => produtos.slice(0, 6), [produtos]);

  const whatsapp = settings?.site.whatsapp || "5511942000000";
  const telefone = settings?.site.telefone || "(11) 3338-6667";
  const email = settings?.site.email || "contato@idealmadeiras.com.br";
  const endereco = settings?.site.endereco || "Rua de Gasômetro, 350 — Brás — São Paulo/SP";
  const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />

      {/* Hero */}
      <HeroCarousel banners={banners} />

      {/* Barra de benefícios em pílulas */}
      <section className="bg-[#f4f4f4] py-6">
        <div className="mx-auto max-w-6xl px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: MessageCircle, t: "COMPRE PELO WHATSAPP", s: "CLIQUE AQUI E FALE AGORA MESMO", color: "#25D366" },
            { icon: Truck, t: "ENTREGA SUPER RÁPIDA", s: "EMPRESA E GARANTIA E QUALIDADE", color: "#0b1a34" },
            { icon: CreditCard, t: "10X PARCELAMENTO DIRETO", s: "VENHA NA LOJA E PARCELE EM 10X", color: "#f39200" },
            { icon: ShieldCheck, t: "COMPRA 100% SEGURA", s: "AQUI TEM SEGURANÇA DE ALTO NÍVEL", color: "#0b1a34" },
          ].map(({ icon: Icon, t, s, color }) => (
            <div key={t} className="flex items-center gap-3 bg-white rounded-full px-4 py-3 shadow-sm border border-neutral-200">
              <span className="w-10 h-10 rounded-full grid place-items-center text-white shrink-0" style={{ backgroundColor: color }}>
                <Icon size={18} />
              </span>
              <div>
                <div className="font-bold text-[11px] text-neutral-800 leading-tight">{t}</div>
                <div className="text-[10px] text-neutral-500 leading-tight">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categorias */}
      {categorias.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <SectionTitle title="CATEGORIAS" />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-5 mt-6">
            {categorias.filter((c) => !c.parent_id).slice(0, 6).map((c) => (
              <Link key={c.id} to="/categoria/$slug" params={{ slug: c.slug }} className="group text-center block">
                <div className="aspect-square rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 group-hover:border-[#f39200] transition-all grid place-items-center">
                  {c.image_url ? (
                    <SupabaseImage src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-neutral-300" />
                  )}
                </div>
                <div className="mt-3 font-semibold text-xs tracking-wide uppercase">{c.name}</div>
                <div className="text-[11px] text-neutral-500">{c.product_count} produtos</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produtos em Destaque */}
      {destaques.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-6">
          <SectionTitle title="PRODUTOS EM DESTAQUE" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
            {destaques.map((p) => <ProductCard key={p.id} p={p} showOferta />)}
          </div>
        </section>
      )}

      {/* Veja Aqui Alguns dos Nossos Produtos */}
      {outrosProdutos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Veja Aqui Alguns dos Nossos Produtos</h3>
            <p className="text-xs text-neutral-500">Portas, Janelas, Esquadrias, Pisos e muito mais...</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {outrosProdutos.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {/* Depoimentos Google */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 items-stretch">
          <div className="bg-white border border-neutral-200 rounded-lg p-5 text-center">
            <div className="text-sm font-semibold">EXCELENTE</div>
            <div className="flex justify-center text-yellow-400 my-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <div className="text-[11px] text-neutral-500">Com base em 84 avaliações</div>
            <div className="mt-2 text-[11px] text-neutral-400">Google</div>
          </div>
          {depoimentos.map((d) => (
            <div key={d.nome} className="bg-white border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-[#f39200] text-white grid place-items-center text-xs font-bold">{d.nome[0]}</span>
                <div>
                  <div className="text-xs font-semibold">{d.nome}</div>
                  <div className="text-[10px] text-neutral-500">1 ano atrás</div>
                </div>
                <div className="ml-auto text-[10px] text-neutral-400">G</div>
              </div>
              <div className="flex text-yellow-400 mb-1">{[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}</div>
              <p className="text-[11px] text-neutral-700 leading-relaxed line-clamp-5">{d.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* O MAIS POPULAR */}
      {maisPopular && (
        <section className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-[1fr_320px] gap-6 items-stretch">
          <HotspotImage
            imageKey="home_popular"
            src={`${IMG}/2024/11/SALA-DE-ESTAR-795x600.webp`}
            alt="Ambiente sala"
            className="min-h-[320px]"
          />
          <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200 flex flex-col justify-center">
            <p className="text-sm text-neutral-500">O MAIS POPULAR</p>
            <p className="text-[11px] text-neutral-400 mt-1">Este item é o mais popular em nosso Catálogo</p>
            <div className="my-4">
              {maisPopular.main_image && <SupabaseImage src={maisPopular.main_image} alt={maisPopular.name} className="w-full h-40 object-contain" />}
            </div>
            <div className="text-sm font-semibold text-center">{maisPopular.name}</div>
            <div className="text-center text-[#f39200] font-bold mt-1">{maisPopular.price}</div>
            <Link to="/produto/$slug" params={{ slug: maisPopular.slug }} className="mt-4 block text-center border border-[#f39200] text-[#f39200] hover:bg-[#f39200] hover:text-white text-xs font-semibold py-2 rounded-full">QUICK VIEW</Link>
            <button className="mt-2 inline-flex items-center justify-center gap-1 text-xs text-neutral-500 hover:text-[#f39200]"><Heart size={12} /> Adicionar à lista de Desejos</button>
          </div>
        </section>
      )}

      {/* OFERTA INCRÍVEL */}
      {oferta && (
        <section className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-[320px_1fr] gap-6 items-stretch">
          <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200 flex flex-col justify-center">
            <p className="text-sm text-neutral-500">OFERTA INCRÍVEL</p>
            <p className="text-[11px] text-neutral-400 mt-1">Este produto está numa Oferta Incrível</p>
            <div className="my-4">
              {oferta.main_image && <SupabaseImage src={oferta.main_image} alt={oferta.name} className="w-full h-40 object-contain" />}
            </div>
            <div className="text-sm font-semibold text-center">{oferta.name}</div>
            <div className="text-[11px] text-center text-neutral-500 uppercase mt-1">Acessórios, Ferragens</div>
            <div className="flex items-baseline justify-center gap-2 mt-1">
              {oferta.old_price && <span className="text-xs text-neutral-400 line-through">{oferta.old_price}</span>}
              <span className="text-[#f39200] font-bold">{oferta.price}</span>
            </div>
            <Link to="/produto/$slug" params={{ slug: oferta.slug }} className="mt-4 block text-center border border-[#f39200] text-[#f39200] hover:bg-[#f39200] hover:text-white text-xs font-semibold py-2 rounded-full">QUICK VIEW</Link>
            <button className="mt-2 inline-flex items-center justify-center gap-1 text-xs text-neutral-500 hover:text-[#f39200]"><Heart size={12} /> Adicionar à lista de Desejos</button>
          </div>
          <div className="relative overflow-hidden rounded-lg">
            <img src={proxyImg(`${IMG}/2024/11/COZINHA-795x600.webp`)} alt="Ambiente" className="w-full h-full object-cover" />
          </div>
        </section>
      )}

      {/* APRENDA COM A IDEAL */}
      <section className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-2 gap-4">
        {aprendaBanners.map((b) => (
          <a key={b.titulo} href="#" className="relative block overflow-hidden rounded-lg group h-40">
            <img src={proxyImg(b.img)} alt={b.titulo} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
            <div className="relative p-6 h-full flex flex-col justify-center max-w-[60%]">
              <span className="text-[10px] uppercase tracking-widest text-[#f39200] font-bold">Aprenda com a Ideal</span>
              <h4 className="text-base font-bold text-neutral-800 mt-1 leading-snug">{b.titulo}</h4>
              <span className="mt-3 text-xs font-semibold text-[#f39200]">LEIA MAIS →</span>
            </div>
          </a>
        ))}
      </section>

      {/* OFERTAS ESPECIAIS */}
      {ofertasEspeciais.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-[240px_1fr] gap-6">
          <aside className="space-y-4">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <div className="text-[10px] uppercase text-[#f39200] font-bold">Dicas Importantes</div>
              <h5 className="text-sm font-bold mt-1 leading-snug">25 Ideias para Comprar a Porta Certa para sua Casa ou Escritório</h5>
              <p className="text-[11px] text-neutral-500 mt-2">Aprenda como escolher bem.</p>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <div className="text-[10px] uppercase text-[#f39200] font-bold">Dicas Importantes</div>
              <h5 className="text-sm font-bold mt-1 leading-snug">15 Tipos de Madeiras que darão Charme e Requinte para sua Casa ou Escritório</h5>
            </div>
          </aside>
          <div>
            <div className="flex items-center gap-6 border-b border-neutral-200 pb-2 mb-4 text-xs font-semibold uppercase tracking-wide">
              <span className="text-[#f39200]">Ofertas Especiais</span>
              <span className="text-neutral-500 hover:text-[#f39200] cursor-pointer">Novos</span>
              <span className="text-neutral-500 hover:text-[#f39200] cursor-pointer">Indicados</span>
              <span className="text-neutral-500 hover:text-[#f39200] cursor-pointer">Campeões de Vendas</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ofertasEspeciais.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CONHEÇA AS NOSSAS LOJAS */}
      <section className="relative bg-[#0b1a34] text-white py-16 my-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={proxyImg(`${IMG}/2024/11/loja-fachada-1.webp`)} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <h3 className="text-2xl font-bold">CONHEÇA AS NOSSAS LOJAS</h3>
          <a href="#lojas" className="mt-4 inline-block bg-[#f39200] hover:bg-[#e08600] text-white text-xs font-bold px-6 py-2 rounded-full uppercase">Clique aqui</a>
        </div>
      </section>

      {/* Instagram */}
      <section className="mx-auto max-w-6xl px-4 py-8 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f39200] to-[#c9184a] grid place-items-center text-white"><Instagram size={18} /></span>
          <div className="text-left">
            <div className="text-sm font-semibold">idealmadeiras.oficial</div>
            <div className="text-[11px] text-neutral-500">987 posts · 2.5K followers</div>
          </div>
          <a href="https://instagram.com/idealmadeiras.oficial" target="_blank" rel="noreferrer" className="ml-2 bg-[#e1306c] text-white text-xs font-semibold px-3 py-1 rounded">Follow</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[1,2,3,4].map((i) => (
            <div key={i} className="aspect-square rounded-md overflow-hidden bg-neutral-100">
              <img src={proxyImg(`${IMG}/2024/11/insta-${i}.webp`)} alt="Instagram" className="w-full h-full object-cover" onError={(e)=>{(e.target as HTMLImageElement).style.opacity='0'}} />
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter amarela */}
      <section className="bg-[#f39200] text-white py-6">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Mail size={28} />
            <div>
              <div className="font-bold text-sm">Receba nossas novidades primeiro!</div>
              <div className="text-xs opacity-90">Cadastre seu e-mail e receba ofertas e descontos exclusivos.</div>
            </div>
          </div>
          <form className="flex gap-2 w-full md:w-auto">
            <input type="email" placeholder="Seu e-mail" className="flex-1 md:w-64 px-3 py-2 rounded text-neutral-900 outline-none text-sm" />
            <button className="bg-[#0b1a34] hover:bg-black px-5 rounded font-semibold text-xs uppercase">Cadastrar</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer id="lojas" className="bg-[#0b1a34] text-neutral-300">
        <div className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <img src={proxyImg(`${IMG}/2024/11/logo-ideal-madeiras-mobile.png`)} alt="Lojas Ideal Madeiras" className="h-16 w-auto mb-4" />
            <p className="text-xs leading-relaxed">A Maior Loja de Portas, Janelas e Pisos de Madeira da Rua do Gasômetro. Venha conferir nosso Show Room e conhecer a maior coleção de madeiras de São Paulo.</p>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1eb659] text-white text-xs font-bold px-4 py-2 rounded-full uppercase">
              <MessageCircle size={14} /> Compre pelo WhatsApp aqui
            </a>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">MENU PRINCIPAL</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white">Sobre a Ideal Madeiras</a></li>
              <li><a href="#" className="hover:text-white">Nossas Lojas</a></li>
              <li><a href="#" className="hover:text-white">Formas de Pagamento</a></li>
              <li><a href="#" className="hover:text-white">Segurança e Privacidade</a></li>
              <li><a href="#" className="hover:text-white">Trocas e Devoluções</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">ATENDIMENTO</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white">Contato</a></li>
              <li><a href="#" className="hover:text-white">Meus Pedidos</a></li>
              <li><a href="#" className="hover:text-white">Cadastre-se</a></li>
              <li className="flex items-center gap-2"><Clock size={12} /> Seg-Sex 8h às 18h</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">NOSSAS LOJAS</h4>
            <div className="space-y-3 text-xs">
              <div>
                <div className="font-semibold text-white">LOJA 1</div>
                <div>Rua de Gasômetro, 350 — Brás — SP</div>
                <div className="flex items-center gap-1 mt-0.5"><Phone size={11} /> {telefone}</div>
                <div className="flex items-center gap-1"><MessageCircle size={11} /> (11) 99400-0507</div>
              </div>
              <div>
                <div className="font-semibold text-white">LOJA 2</div>
                <div>Rua de Gasômetro, 284 — Brás — SP</div>
              </div>
              <div>
                <div className="font-semibold text-white">LOJA 3</div>
                <div>Rua de Gasômetro, 306 — Brás — SP</div>
              </div>
              <div className="flex items-center gap-1"><Mail size={11} /> {email}</div>
              <div className="flex items-start gap-1"><MapPin size={11} className="mt-0.5" /> {endereco}</div>
            </div>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 grid place-items-center rounded-full border border-neutral-700 hover:bg-[#f39200] hover:border-[#f39200]"><Facebook size={14} /></a>
              <a href="#" className="w-8 h-8 grid place-items-center rounded-full border border-neutral-700 hover:bg-[#f39200] hover:border-[#f39200]"><Instagram size={14} /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="uppercase">Formas de Pagamento:</span>
              <div className="flex gap-1">
                {["VISA","MC","AMEX","ELO","HIPER","PIX","BOLETO"].map((m) => (
                  <span key={m} className="bg-white text-neutral-800 px-2 py-1 rounded text-[9px] font-bold">{m}</span>
                ))}
              </div>
            </div>
            <div>© {new Date().getFullYear()} Lojas Ideal Madeiras — Todos os direitos reservados.</div>
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
  return (
    <div className="border-b border-neutral-200 pb-2">
      <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-800 inline-block border-b-2 border-[#f39200] pb-2">
        {title}
      </h2>
    </div>
  );
}

function ProductCard({ p, compact, showOferta }: { p: Product; compact?: boolean; showOferta?: boolean }) {
  const hasOferta = showOferta && !!p.old_price;
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const whatsapp = settings?.site.whatsapp || "5511942000000";
  return (
    <div className="group relative border border-neutral-200 rounded-lg overflow-visible bg-white hover:shadow-lg hover:border-[#f39200]/50 transition-all flex flex-col">
      <Link to="/produto/$slug" params={{ slug: p.slug }} className="block">
        <div className="relative aspect-square bg-white overflow-hidden rounded-t-lg">
          {hasOferta && (
            <span className="absolute top-2 left-2 z-10 bg-[#c9184a] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Oferta</span>
          )}
          {p.main_image && (
            <SupabaseImage src={p.main_image} alt={p.name} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
          )}
          <span aria-label="Adicionar à Lista de Desejos" className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 grid place-items-center text-neutral-600 hover:text-[#f39200] shadow">
            <Heart size={16} />
          </span>
        </div>
        <div className={`p-3 ${compact ? "text-center" : ""}`}>
          <h3 className={`font-medium text-neutral-800 ${compact ? "text-xs" : "text-xs"} line-clamp-2 min-h-[2.4rem] uppercase tracking-wide`}>{p.name}</h3>
          <div className="text-[10px] text-neutral-400 uppercase mt-1">{p.types?.[0] || "Portas"}</div>
          <div className="mt-2 flex text-yellow-400 justify-start">
            {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            {p.old_price && <span className="text-[11px] text-neutral-400 line-through">{p.old_price}</span>}
            <div className={`font-bold text-[#f39200] ${compact ? "text-sm" : "text-base"}`}>{p.price}</div>
          </div>
        </div>
      </Link>
      <ProductHoverCard product={p} whatsapp={whatsapp} accent="#f39200" category={p.types?.[0]} />
    </div>
  );
}
