import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Heart, Phone, Mail, MapPin, Facebook, Instagram,
  MessageCircle, Star, ChevronRight, ChevronLeft, Image as ImageIcon,
  Truck, CreditCard, ShieldCheck, Mail as MailIcon,
} from "lucide-react";
import {
  fetchCategories, fetchProducts, fetchBanners, fetchSettings, fetchShoppableScenes, proxyImg, productPath,
  type Product, type Banner, type ShoppableScene,
} from "@/lib/site-data";
import { SupabaseImage } from "@/components/SupabaseImage";
import { SiteHeader } from "@/components/SiteHeader";

const ORANGE = "#f59318";
const NAVY = "#0b1a34";
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
    <section className="mx-auto max-w-7xl px-4 pt-4">
      <div className="relative overflow-hidden group">
        <a href={current.link_url ?? "#"} className="block">
          <SupabaseImage src={current.image_url} alt={current.title ?? ""} className="w-full h-auto" />
        </a>
        {total > 1 && (
          <>
            <button type="button" aria-label="Anterior" onClick={() => go(idx - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={22} />
            </button>
            <button type="button" aria-label="Próximo" onClick={() => go(idx + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity">
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
  { nome: "Anderson Vieira", texto: "A Ideal Madeiras é um ótimo lugar para comprar os primeiros portas da minha casa. Tive ótimas orientações." },
  { nome: "Eliana Sampaio", texto: "Segunda vez que faço compras de portas nessa loja, nunca mudaram o atendimento, sempre nos atenderam bem." },
  { nome: "Sandra Karito", texto: "Gisele fez um atendimento nota MIL. Voltarei a comprar com certeza." },
];

const dicas = [
  { tag: "DICAS IMPORTANTES", titulo: "25 Ideias para Comprar a Porta Certa para sua Casa ou Escritório", img: `${IMG}/2024/11/SALA-DE-ESTAR-795x600.webp` },
  { tag: "DICAS IMPORTANTES", titulo: "15 Tipos de Madeiras que darão Charme e Requinte para sua Casa ou Escritório", img: `${IMG}/2024/11/COZINHA-795x600.webp` },
];

function Home() {
  const { data: categorias = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: produtos = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: banners = [] } = useQuery({ queryKey: ["banners"], queryFn: fetchBanners });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: shoppable = [] } = useQuery({ queryKey: ["shoppable-scenes"], queryFn: () => fetchShoppableScenes(true) });

  const destaques = produtos.filter((p) => p.featured).slice(0, 5);
  const grade = produtos.filter((p) => !p.featured).slice(0, 12);
  const maisPopular = produtos.find((p) => p.most_viewed) || produtos[0];
  const oferta = produtos.find((p) => p.old_price);
  const novos = produtos.slice(0, 5);
  const indicados = produtos.slice(5, 10);
  const campeoes = produtos.filter((p) => p.most_viewed).slice(0, 5);

  const whatsapp = settings?.site.whatsapp || "5511942000000";
  const telefone = settings?.site.telefone || "(11) 4200-0000";
  const email = settings?.site.email || "contato@idealmadeiras.com.br";
  const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <SiteHeader />

      {/* Hero */}
      <HeroCarousel banners={banners} />

      {/* Benefits pill row (like reference) */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-100/70 rounded-xl p-4">
          {[
            { icon: MessageCircle, t: "COMPRE PELO WHATSAPP", s: "Clique aqui e fale agora mesmo", href: whatsappHref },
            { icon: Truck, t: "ENTREGA SUPER RÁPIDA", s: "Rápido e garantido" },
            { icon: CreditCard, t: "10x PARCELAMENTO DIRETO", s: "Sem juros no cartão" },
            { icon: ShieldCheck, t: "COMPRA 100% SEGURA", s: "Ambiente de alto nível" },
          ].map(({ icon: Icon, t, s, href }) => (
            <a key={t} href={href ?? "#"} className="flex items-center gap-3 bg-white rounded-full pl-3 pr-5 py-3 shadow-sm hover:shadow-md transition-shadow">
              <span className="w-10 h-10 rounded-full grid place-items-center text-white shrink-0" style={{ background: ORANGE }}>
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold tracking-wide truncate">{t}</div>
                <div className="text-[10px] text-neutral-500 truncate">{s}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Categorias */}
      {categorias.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <SectionTitle title="CATEGORIAS" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            {categorias.filter((c) => !c.parent_id).slice(0, 12).map((c) => (
              <Link key={c.id} to="/categoria/$slug" params={{ slug: c.slug }} className="group text-center block">
                <div className="aspect-square rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 group-hover:border-[color:var(--o)] transition-all grid place-items-center" style={{ ["--o" as any]: ORANGE }}>
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
          <SectionTitle title="PRODUTOS EM DESTAQUE" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
            {destaques.map((p) => <ProductCard key={p.id} p={p} showOferta />)}
          </div>
        </section>
      )}

      {/* Veja aqui alguns dos nossos produtos */}
      {grade.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold">Veja Aqui Alguns dos Nossos Produtos</h3>
            <p className="text-xs text-neutral-500">Portas, Janelas, Esquadrias, Pisos e muito mais...</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {grade.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}


      {/* Google reviews strip */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 items-stretch bg-neutral-50 rounded-lg border border-neutral-200 p-4">
          <div className="text-center md:border-r md:border-neutral-200 md:pr-4 flex flex-col justify-center">
            <div className="text-lg font-bold">Excelente</div>
            <div className="flex justify-center text-yellow-400 my-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
            </div>
            <div className="text-xs text-neutral-500">Com base em <b>84 avaliações</b></div>
            <div className="mt-2 text-[11px] text-neutral-400">Google</div>
          </div>
          {depoimentos.map((d) => (
            <div key={d.nome} className="bg-white rounded-md p-3 border border-neutral-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-full grid place-items-center text-white text-xs font-bold" style={{ background: "#4285F4" }}>
                  {d.nome.charAt(0)}
                </span>
                <div>
                  <div className="text-xs font-semibold">{d.nome}</div>
                  <div className="text-[10px] text-neutral-400">1 ano atrás</div>
                </div>
                <span className="ml-auto text-[10px] font-bold text-neutral-400">G</span>
              </div>
              <div className="flex text-yellow-400 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
              </div>
              <p className="text-[11px] text-neutral-700 leading-relaxed line-clamp-4">{d.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* O Mais Popular + ambiente (com pins interativos quando houver cenas) */}
      {maisPopular && (
        <section className="mx-auto max-w-7xl px-4 py-6 space-y-6">
          {(shoppable.length > 0 ? shoppable : [null]).map((scene, i) => (
            <ShoppablePopularBlock
              key={scene?.id ?? `default-${i}`}
              scene={scene}
              defaultProduct={maisPopular}
              products={produtos}
              categorias={categorias}
              fallbackImage={`${IMG}/2024/11/SALA-DE-ESTAR-795x600.webp`}
            />
          ))}
        </section>
      )}

      {/* Oferta Incrível */}
      {oferta && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid md:grid-cols-[1fr_2fr] gap-4 items-stretch">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5 flex flex-col">
              <div className="text-xs font-bold tracking-widest text-neutral-500">OFERTA INCRÍVEL</div>
              <p className="text-[11px] text-neutral-500 mt-1">Este produto está numa Oferta Incrível</p>
              <div className="my-4 aspect-square bg-white rounded overflow-hidden grid place-items-center">
                {oferta.main_image && <SupabaseImage src={oferta.main_image} alt={oferta.name} className="w-full h-full object-contain p-4" />}
              </div>
              <div className="text-sm font-semibold text-center">{oferta.name}</div>
              <div className="flex items-center justify-center gap-2 mt-2">
                {oferta.old_price && <span className="text-xs text-neutral-400 line-through">{oferta.old_price}</span>}
                <span className="font-bold" style={{ color: ORANGE }}>{oferta.price}</span>
              </div>
              <Link to={productPath(oferta, categorias) as any} className="mt-3 block text-center border border-neutral-800 text-neutral-800 hover:bg-neutral-800 hover:text-white text-xs font-semibold py-2 rounded transition-colors">
                QUICK VIEW
              </Link>
              <button className="mt-2 text-xs text-neutral-500 hover:text-neutral-800 inline-flex items-center justify-center gap-1">
                <Heart size={12} /> Adicionar à Lista de Desejos
              </button>
            </div>
            <div className="relative rounded-lg overflow-hidden bg-neutral-100">
              <img src={proxyImg(`${IMG}/2024/11/COZINHA-795x600.webp`)} alt="Ambiente" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
      )}

      {/* Aprenda com a Ideal - dual dark banners */}
      <section className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-2 gap-4">
        {[
          { t: "Como manter o acabamento de suas Portas em perfeito estado", img: `${IMG}/2024/11/SALA-DE-ESTAR-795x600.webp` },
          { t: "Formas de Lubrificar Janelas e Venezianas de forma eficiente e sem perdas", img: `${IMG}/2024/11/COZINHA-795x600.webp` },
        ].map((b) => (
          <a key={b.t} href="#" className="relative block overflow-hidden rounded-lg group h-40">
            <img src={proxyImg(b.img)} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative p-6 text-white h-full flex flex-col justify-center">
              <div className="text-[10px] font-bold tracking-widest opacity-80">APRENDA COM A IDEAL</div>
              <div className="text-lg font-bold mt-1 max-w-sm leading-snug">{b.t}</div>
              <div className="mt-3 inline-flex w-fit items-center gap-1 text-xs font-bold border-b pb-0.5" style={{ borderColor: ORANGE, color: ORANGE }}>
                LEIA MAIS
              </div>
            </div>
          </a>
        ))}
      </section>

      {/* Ofertas Especiais tabs + dicas */}
      <section className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-[1fr_3fr] gap-4">
        <div className="space-y-4">
          {dicas.map((d) => (
            <a key={d.titulo} href="#" className="relative block overflow-hidden rounded-lg h-40 group">
              <img src={proxyImg(d.img)} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative p-4 h-full flex flex-col justify-center text-white">
                <div className="text-[10px] font-bold tracking-widest opacity-80">{d.tag}</div>
                <div className="text-sm font-bold leading-snug mt-1">{d.titulo}</div>
                <div className="mt-2 text-[10px] font-bold" style={{ color: ORANGE }}>Aprenda como escolher hoje</div>
              </div>
            </a>
          ))}
        </div>
        <div>
          <OfertasTabs novos={novos} indicados={indicados} campeoes={campeoes} categorias={categorias} />
        </div>
      </section>

      {/* Conheça as nossas lojas */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <a href="#" className="relative block rounded-lg overflow-hidden h-48 group">
          <div className="absolute inset-0" style={{ background: NAVY }} />
          <img src={proxyImg(`${IMG}/2024/11/SALA-DE-ESTAR-795x600.webp`)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="relative h-full grid place-items-center text-center text-white">
            <div>
              <div className="text-2xl md:text-3xl font-bold tracking-wide">CONHEÇA AS NOSSAS LOJAS</div>
              <button className="mt-4 px-6 py-2 rounded-full font-bold text-xs text-white" style={{ background: ORANGE }}>CLIQUE AQUI</button>
            </div>
          </div>
        </a>
      </section>

      {/* Instagram strip */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-full mx-auto grid place-items-center text-white" style={{ background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}>
            <Instagram size={26} />
          </div>
          <div className="text-sm font-semibold mt-2">idealmadeiras.oficial</div>
          <div className="text-xs text-neutral-500">987 posts · 2.5K followers</div>
          <a href="https://instagram.com/idealmadeiras.oficial" target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs bg-[#1DA1F2] text-white px-3 py-1 rounded font-semibold">
            Follow
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map((i) => (
            <a key={i} href="#" className="block aspect-square rounded overflow-hidden bg-neutral-100">
              <img src={proxyImg(`${IMG}/2024/11/${i % 2 === 0 ? "COZINHA" : "SALA-DE-ESTAR"}-795x600.webp`)} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </a>
          ))}
        </div>
      </section>

      {/* Newsletter yellow */}
      <section className="py-8" style={{ background: ORANGE }}>
        <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-4 items-center text-white">
          <div className="flex items-center gap-3">
            <MailIcon size={40} />
            <div>
              <div className="text-lg font-bold">Receba nossas novidades primeiro</div>
              <div className="text-xs opacity-90">Inscreva seu e-mail e receba ofertas e descontos exclusivos!</div>
            </div>
          </div>
          <form className="flex gap-2">
            <input type="email" placeholder="Seu melhor e-mail" className="flex-1 px-4 py-3 rounded-md text-neutral-900 outline-none bg-white" />
            <button className="bg-neutral-900 hover:bg-black px-6 rounded-md font-semibold text-sm">CADASTRAR</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-neutral-300" style={{ background: NAVY }}>
        <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <img src={proxyImg(`${IMG}/2024/09/logo-ideal-madeiras.png`)} alt="Lojas Ideal Madeiras" className="h-16 w-auto mb-4" />
            <p className="text-xs leading-relaxed">A Maior Loja de Portas, Janelas e Pisos de Madeira da Rua do Gasômetro. Venha Conferir nossas Show Room e conhecer a maior coleção de Madeiras da região de São Paulo.</p>
            <a href={whatsappHref} className="mt-4 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1eb659] text-white px-4 py-2 rounded font-semibold text-xs">
              <MessageCircle size={14} /> COMPRE PELO WHATSAPP AGORA
            </a>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wide">MENU PRINCIPAL</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white">Sobre a Ideal Madeiras</a></li>
              <li><a href="#" className="hover:text-white">Nossas Lojas</a></li>
              <li><a href="#" className="hover:text-white">Formas de Pagamento</a></li>
              <li><a href="#" className="hover:text-white">Segurança e Privacidade</a></li>
              <li><a href="#" className="hover:text-white">Trocas e Devoluções</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 tracking-wide">ATENDIMENTO</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2"><Mail size={12} style={{ color: ORANGE }} /> {email}</li>
              <li className="flex items-center gap-2"><Phone size={12} style={{ color: ORANGE }} /> {telefone}</li>
              <li><a href="#" className="hover:text-white">Meus Pedidos</a></li>
              <li><a href="#" className="hover:text-white">Cadastre-se</a></li>
            </ul>
          </div>
          <div className="space-y-4 text-xs">
            {[
              { l: "LOJA 1", e: "Rua do Gasômetro, 350 - Brás - SP", t: "(11) 99400-0507" },
              { l: "LOJA 2", e: "Rua do Gasômetro, 284 - Brás - SP", t: "(11) 3326-3197" },
              { l: "LOJA 3", e: "Rua do Gasômetro, 306 - Brás - SP", t: "(11) 98801-3370" },
            ].map((l) => (
              <div key={l.l}>
                <div className="text-white font-bold">{l.l}</div>
                <div className="flex items-start gap-1 mt-1"><MapPin size={11} className="mt-0.5" style={{ color: ORANGE }} /><span>{l.e}</span></div>
                <div className="flex items-center gap-1 mt-1"><MessageCircle size={11} style={{ color: ORANGE }} /><span>{l.t}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-neutral-400">
            <div>Formas de Pagamento aceitas</div>
            <div className="flex gap-3 opacity-70">
              <a href="#" aria-label="Facebook" className="hover:text-white"><Facebook size={14} /></a>
              <a href="#" aria-label="Instagram" className="hover:text-white"><Instagram size={14} /></a>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 pb-4 text-center text-[10px] text-neutral-500">
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

function OfertasTabs({ novos, indicados, campeoes, categorias }: { novos: Product[]; indicados: Product[]; campeoes: Product[]; categorias: any[] }) {
  const [tab, setTab] = useState<"novos" | "indicados" | "campeoes">("novos");
  const lista = tab === "novos" ? novos : tab === "indicados" ? indicados : campeoes;
  return (
    <div>
      <div className="flex items-center gap-6 border-b border-neutral-200 mb-4">
        <div className="text-sm font-bold uppercase tracking-wide mr-auto">Ofertas Especiais</div>
        {(["novos", "indicados", "campeoes"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)}
            className={`pb-2 text-xs font-bold uppercase tracking-wide ${tab === k ? "border-b-2" : "text-neutral-500"}`}
            style={tab === k ? { color: ORANGE, borderColor: ORANGE } : undefined}>
            {k === "campeoes" ? "Campeões de Vendas" : k}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {lista.map((p) => <ProductCard key={p.id} p={p} compact categorias={categorias} />)}
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle, center }: { title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={`border-b border-neutral-200 pb-2 ${center ? "text-center" : ""}`}>
      <h2 className="text-lg md:text-xl font-bold tracking-wide inline-block relative">
        {title}
        <span className="absolute left-0 -bottom-[9px] h-0.5 w-full" style={{ background: ORANGE }} />
      </h2>
      {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function ProductCard({ p, compact, showOferta, categorias: catsProp }: { p: Product; compact?: boolean; showOferta?: boolean; categorias?: any[] }) {
  const { data: categoriasQ = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories, enabled: !catsProp });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const categorias = catsProp ?? categoriasQ;
  const to = productPath(p, categorias) as any;
  const categoria = categorias.find((c: any) => c.id === p.category_id);
  const catNome = categoria?.name ?? "";
  const whatsapp = (settings?.site.whatsapp || "5511942000000").replace(/\D/g, "");
  const waMsg = encodeURIComponent(`Olá! Tenho interesse no produto: ${p.name} (${p.price}). Poderia me passar mais informações?`);
  const waUrl = `https://wa.me/${whatsapp}?text=${waMsg}`;
  const descricao = p.description || "Fale com um de nossos vendedores e receba um orçamento personalizado com condições especiais.";

  return (
    <div className="group relative border border-neutral-200 rounded bg-white hover:shadow-xl hover:border-[color:var(--o)] hover:z-20 transition-all flex flex-col" style={{ ["--o" as any]: ORANGE }}>
      <Link to={to} className="block">
        <div className="relative aspect-square bg-neutral-50 overflow-hidden">
          {showOferta && p.old_price && (
            <span className="absolute top-2 left-2 z-10 text-white text-[10px] font-bold px-2 py-1" style={{ background: ORANGE }}>OFERTA</span>
          )}
          {p.main_image && (
            <SupabaseImage src={p.main_image} alt={p.name} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
          )}
        </div>
        <div className={`p-3 ${compact ? "text-center" : ""}`}>
          <h3 className={`font-medium text-neutral-800 ${compact ? "text-[11px]" : "text-xs"} line-clamp-2 min-h-[2.25rem]`}>{p.name}</h3>
          {catNome && <div className="mt-1 text-[10px] uppercase tracking-widest text-neutral-500">{catNome}</div>}
          <div className={`mt-1 font-bold ${compact ? "text-xs" : "text-sm"}`} style={{ color: ORANGE }}>{p.price}</div>
        </div>
      </Link>

      <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 absolute left-0 right-0 top-full bg-white border border-t-0 border-[color:var(--o)] shadow-xl p-4 z-30" style={{ ["--o" as any]: ORANGE }}>
        <p className="text-xs text-neutral-600 line-clamp-4">{descricao}</p>
        <div className="mt-3 flex flex-col gap-2">
          <Link to="/checkout" search={{ slug: p.slug, qty: 1 }} className="w-full text-center text-white text-[11px] font-bold px-3 py-2 rounded-full uppercase tracking-wide hover:opacity-90" style={{ background: ORANGE }}>
            Solicitar Orçamento
          </Link>
          <a href={waUrl} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1eb659] text-white text-[11px] font-bold px-3 py-2 rounded-full uppercase tracking-wide">
            <MessageCircle size={13} /> Falar com Vendedor Agora
          </a>
          <button aria-label="Adicionar à Lista de Desejos" className="inline-flex items-center justify-center gap-1 text-[11px] text-neutral-600 hover:text-[color:var(--o)]">
            <Heart size={13} /> Adicionar à lista de desejos
          </button>
        </div>
      </div>
    </div>
  );
}

function ShoppableSceneView({ scene, products, categorias }: { scene: ShoppableScene; products: Product[]; categorias: any[] }) {
  const productById = new Map(products.map((p) => [p.id, p]));
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
      <SupabaseImage src={scene.image_url} alt={scene.title ?? ""} className="w-full h-auto block" />
      {scene.pins.map((pin) => {
        const p = pin.product_id ? productById.get(pin.product_id) : null;
        return (
          <div key={pin.id} className="absolute -translate-x-1/2 -translate-y-1/2 group/pin" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
            <button
              aria-label={pin.label ?? p?.name ?? "Produto"}
              className="relative w-6 h-6 rounded-full border-2 border-white shadow-lg grid place-items-center focus:outline-none"
              style={{ background: ORANGE }}
            >
              <span className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ background: ORANGE }} />
              <span className="relative w-2 h-2 rounded-full bg-white" />
            </button>
            {p && (
              <div className="pointer-events-none opacity-0 group-hover/pin:opacity-100 group-hover/pin:pointer-events-auto transition-opacity duration-200 absolute left-1/2 -translate-x-1/2 top-full mt-3 w-64 bg-white rounded-lg shadow-2xl border border-neutral-200 p-3 z-20">
                <div className="aspect-square bg-neutral-50 rounded overflow-hidden">
                  {p.main_image && <SupabaseImage src={p.main_image} alt={p.name} className="w-full h-full object-contain p-2" />}
                </div>
                <h4 className="mt-2 text-sm font-semibold line-clamp-2 text-center">{p.name}</h4>
                <div className="mt-1 text-center font-bold" style={{ color: ORANGE }}>{p.price}</div>
                <Link
                  to={productPath(p, categorias) as any}
                  className="mt-3 block w-full text-center text-white text-[11px] font-bold px-3 py-2 rounded-full uppercase tracking-wide hover:opacity-90"
                  style={{ background: ORANGE }}
                >
                  Faça seu orçamento aqui
                </Link>
              </div>
            )}
            {!p && pin.label && (
              <div className="pointer-events-none opacity-0 group-hover/pin:opacity-100 transition-opacity duration-200 absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap bg-neutral-900 text-white text-xs px-2 py-1 rounded">
                {pin.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
