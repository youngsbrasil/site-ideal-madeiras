import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  User,
  Heart,
  ShoppingCart,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Truck,
  CreditCard,
  ShieldCheck,
  MessageCircle,
  Star,
  ChevronRight,
} from "lucide-react";

const IMG = "https://idealmadeiras.com.br/wp-content/uploads";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PÁGINA PRINCIPAL - Lojas Ideal Madeiras" },
      {
        name: "description",
        content:
          "Loja de Portas, Janelas, Ferragens e Fechaduras em São Paulo. Portas maciças, pivotantes, fechaduras digitais, puxadores, pisos e muito mais.",
      },
      { property: "og:title", content: "PÁGINA PRINCIPAL - Lojas Ideal Madeiras" },
      {
        property: "og:description",
        content:
          "Portas, Janelas, Esquadrias, Pisos e muito mais. Compra segura, entrega rápida e parcelamento.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: `${IMG}/2024/11/COMPRE-PELO-WHATSAPP.png`,
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const categorias = [
  { nome: "ACESSÓRIOS", qtd: 40, img: `${IMG}/2024/10/THUMB-ACESSORIOS-768x768.png` },
  { nome: "FECHADURAS", qtd: 62, img: `${IMG}/2024/10/THUMB-FECHADURAS-768x768.png` },
  { nome: "JANELAS", qtd: 6, img: `${IMG}/2024/10/THUMB-JANELAS-768x768.png` },
  { nome: "PORTAS", qtd: 110, img: `${IMG}/2024/10/THUMB-PORTAS-768x768.png` },
  { nome: "PUXADORES", qtd: 23, img: `${IMG}/2024/10/THUMB-PUXADORES-768x768.png` },
  { nome: "VITRÔS", qtd: 12, img: `${IMG}/2024/10/THUMB-VITROS-768x768.png` },
];

const destaques = [
  {
    nome: "Porta de Correr 03 Folhas Panorâmica com Almofada Especial",
    preco: "R$ 3.499,00",
    img: `${IMG}/2024/10/PORTA-DE-CORRER-03-FOLHAS-PANORAMICA-COM-ALMOFADA-ESPECIAL-800x800.png`,
  },
  {
    nome: "Porta Maciça Paris Cedro Arana",
    preco: "R$ 1.290,00",
    img: `${IMG}/2021/08/PORTA-MACICA-PARIS-CEDRO-ARANA-800x800.png`,
  },
  {
    nome: "Conjunto Renolit Branco com Demolição",
    preco: "R$ 2.750,00",
    img: `${IMG}/2021/08/CONJUNTO-RENOLIT-BRANCO-COM-DEMOLICAO-800x800.png`,
  },
  {
    nome: "Conjunto Pivotante Painel Clean Cedro Arana",
    preco: "R$ 3.190,00",
    img: `${IMG}/2024/10/CONJUNTO-PIVOTANTE-COM-PAINEL-CLEAN-CEDRO-ARANA-800x800.png`,
  },
  {
    nome: "Conjunto Pivotante Mexicana Horizontal com Visor Curvo",
    preco: "R$ 3.590,00",
    img: `${IMG}/2021/08/CONJUNTO-PIVOTANTE-MEXICANA-HORIZONTAL-COM-VISOR-CURVO-CEDRO-ARANA-800x800.png`,
  },
  {
    nome: "Conjunto Pivotante Suíça Cedro Arana",
    preco: "R$ 2.990,00",
    img: `${IMG}/2021/08/CONJUNTO-PIVOTANTE-SUICA-CEDRO-ARANA-800x800.png`,
  },
  {
    nome: "Par de Puxadores 733 Verona Inox Cromado 100cm",
    preco: "R$ 489,00",
    img: `${IMG}/2024/11/PAR-DE-PUXADORES-733-VERONA-INOX-CROMADO-100CM-800x800.png`,
  },
  {
    nome: "Fechadura Pado Bico de Papagaio Duplo Externa Escovada",
    preco: "R$ 349,00",
    img: `${IMG}/2026/01/FECHADURA-PADO-BICO-DE-PAPAGAIO-DUPLO-EXTERNA-ESCOVADA.png`,
  },
];

const maisVistos = [
  {
    nome: "Fechadura Odin Cromo Acetinado Imab",
    preco: "R$ 299,00",
    img: `${IMG}/2024/11/FECHADURA-ODIN-CROMO-ACETINADO-IMAB-1-800x800.png`,
  },
  {
    nome: "Piso Pronto de Madeira Maciça Tauari",
    preco: "R$ 219,00",
    img: `${IMG}/2024/11/PISO-PRONTO-DE-MADEIRA-MACICA-TAUARI-800x800.png`,
  },
  {
    nome: "Puxador Alumínio Concha de Embutir Preto",
    preco: "R$ 89,00",
    img: `${IMG}/2024/11/PUXADOR-ALUMINIO-CONCHA-DE-EMBUTIR-PRETO-1-800x800.png`,
  },
  {
    nome: "Fechadura Bico Papagaio Cilindro Duplo Preta",
    preco: "R$ 319,00",
    img: `${IMG}/2024/11/FECHADURA-BICO-PAPAGAIO-CILINDRO-DUPLO-PRETA-800x800.png`,
  },
  {
    nome: "Fechadura Rolete com Lingueta Preta Redonda Arouca",
    preco: "R$ 189,00",
    img: `${IMG}/2024/11/FECHADURA-ROLETE-COM-LINGUETA-PRETA-REDONDA-AROUCA-800x800.png`,
  },
  {
    nome: "Par de Levantador para Janela",
    preco: "R$ 79,00",
    img: `${IMG}/2024/11/PAR-DE-LEVANTADOR-PARA-JANELA-800x800.png`,
  },
];

const oferta = {
  nome: "Fechadura Pado Digital 800 Vision",
  preco: "R$ 1.499,00",
  precoAntigo: "R$ 1.899,00",
  img: `${IMG}/2026/01/FECHADURA-PADO-DIGITAL-800-VISION-5-800x800.png`,
};

const ambientes = [
  { nome: "Sala de Estar", img: `${IMG}/2024/11/SALA-DE-ESTAR-795x600.webp` },
  { nome: "Cozinha", img: `${IMG}/2024/11/COZINHA-795x600.webp` },
];

const depoimentos = [
  {
    nome: "Ana Paula",
    texto:
      "Atendimento excelente e portas de altíssima qualidade. Entregaram no prazo e tudo perfeito!",
  },
  {
    nome: "Carlos Eduardo",
    texto:
      "Comprei uma pivotante e o resultado ficou incrível. Recomendo demais a Ideal Madeiras.",
  },
  {
    nome: "Juliana",
    texto: "Gisele fez um atendimento nota MIL. Voltarei a comprar com certeza.",
  },
  {
    nome: "Marcos",
    texto:
      "Preços justos, produtos de primeira e uma equipe muito atenciosa. Super indico.",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Top bar */}
      <div className="bg-[#A7144C] text-white text-xs">
        <div className="mx-auto max-w-7xl px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <span className="tracking-wide">
            FRETE GRÁTIS PARA TODOS OS PEDIDOS ACIMA DE R$ 150
          </span>
          <div className="hidden md:flex items-center gap-4">
            <a href="#" className="hover:underline flex items-center gap-1">
              <Phone size={12} /> (11) 4200-0000
            </a>
            <a href="#" className="hover:underline flex items-center gap-1">
              <Facebook size={14} />
            </a>
            <a href="#" className="hover:underline flex items-center gap-1">
              <Instagram size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-wrap items-center gap-4">
          <a href="/" className="shrink-0">
            <img
              src={`${IMG}/2024/09/logo-ideal-madeiras.png`}
              alt="Lojas Ideal Madeiras"
              className="h-14 w-auto"
            />
          </a>
          <form className="flex-1 min-w-[240px] order-3 md:order-2">
            <div className="flex items-stretch rounded-full border border-neutral-300 overflow-hidden focus-within:border-[#A7144C]">
              <input
                type="text"
                placeholder="O que você está procurando?"
                className="flex-1 px-5 py-3 text-sm outline-none"
              />
              <button
                type="submit"
                className="bg-[#A7144C] text-white px-5 flex items-center gap-2 text-sm font-medium hover:bg-[#8b1140]"
              >
                <Search size={16} /> Buscar
              </button>
            </div>
          </form>
          <div className="flex items-center gap-6 order-2 md:order-3 ml-auto">
            <a href="#" className="flex items-center gap-2 text-sm hover:text-[#A7144C]">
              <User size={20} />
              <span className="hidden sm:block leading-tight">
                <span className="block text-[11px] text-neutral-500">Minha</span>
                Conta
              </span>
            </a>
            <a href="#" className="flex items-center gap-2 text-sm hover:text-[#A7144C]">
              <Heart size={20} />
              <span className="hidden sm:inline">Desejos</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-sm hover:text-[#A7144C] relative">
              <ShoppingCart size={20} />
              <span className="hidden sm:inline">Carrinho</span>
              <span className="absolute -top-1 -right-2 bg-[#A7144C] text-white text-[10px] rounded-full w-4 h-4 grid place-items-center">
                0
              </span>
            </a>
          </div>
        </div>

        {/* Nav */}
        <nav className="bg-neutral-900 text-white">
          <div className="mx-auto max-w-7xl px-4">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-sm font-medium">
              {[
                "Início",
                "Portas",
                "Janelas",
                "Fechaduras",
                "Puxadores",
                "Pisos",
                "Acessórios",
                "Ofertas",
                "Contato",
              ].map((i) => (
                <li key={i}>
                  <a href="#" className="hover:text-[#f8b7cc] transition-colors">
                    {i}
                  </a>
                </li>
              ))}
              <li className="ml-auto flex items-center gap-2 text-[#f8b7cc]">
                <MessageCircle size={16} /> Compre pelo WhatsApp
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Hero banner */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <a href="#" className="block overflow-hidden rounded-lg">
          <img
            src={`${IMG}/2024/11/COMPRE-PELO-WHATSAPP.png`}
            alt="Compre pelo WhatsApp"
            className="w-full h-auto"
          />
        </a>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 pb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Truck, t: "Entrega Rápida", s: "Para todo o Brasil" },
          { icon: CreditCard, t: "Parcelamento", s: "Em até 12x sem juros" },
          { icon: ShieldCheck, t: "Compra Segura", s: "Site 100% protegido" },
          { icon: MessageCircle, t: "Atendimento", s: "Consultores especializados" },
        ].map(({ icon: Icon, t, s }) => (
          <div
            key={t}
            className="flex items-center gap-3 border border-neutral-200 rounded-lg p-4 hover:border-[#A7144C] transition-colors"
          >
            <Icon className="text-[#A7144C] shrink-0" size={32} />
            <div>
              <div className="font-semibold text-sm">{t}</div>
              <div className="text-xs text-neutral-500">{s}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Categorias */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionTitle title="CATEGORIAS" subtitle="Portas, Janelas, Esquadrias, Pisos e muito mais..." />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {categorias.map((c) => (
            <a
              key={c.nome}
              href="#"
              className="group text-center block"
            >
              <div className="aspect-square rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 group-hover:border-[#A7144C] transition-all">
                <img
                  src={c.img}
                  alt={c.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="mt-3 font-semibold text-sm tracking-wide">{c.nome}</div>
              <div className="text-xs text-neutral-500">{c.qtd} produtos</div>
            </a>
          ))}
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <SectionTitle title="PRODUTOS EM DESTAQUE" subtitle="Os mais procurados da nossa loja" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
          {destaques.map((p) => (
            <ProductCard key={p.nome} p={p} />
          ))}
        </div>
      </section>

      {/* Banner duplo ambientes */}
      <section className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-2 gap-5">
        {ambientes.map((a) => (
          <a key={a.nome} href="#" className="relative block overflow-hidden rounded-lg group">
            <img src={a.img} alt={a.nome} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500" />
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
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid md:grid-cols-2 gap-8 items-center bg-neutral-50 rounded-xl p-6 md:p-10 border border-neutral-200">
          <div className="relative">
            <span className="absolute top-2 left-2 z-10 bg-[#A7144C] text-white text-xs font-bold px-3 py-1 rounded-full">
              OFERTA INCRÍVEL
            </span>
            <img src={oferta.img} alt={oferta.nome} className="w-full max-w-md mx-auto" />
          </div>
          <div>
            <p className="text-sm text-[#A7144C] font-semibold uppercase tracking-widest">
              Este produto está numa Oferta Incrível
            </p>
            <h3 className="text-3xl font-bold mt-2">{oferta.nome}</h3>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-neutral-400 line-through">{oferta.precoAntigo}</span>
              <span className="text-3xl font-bold text-[#A7144C]">{oferta.preco}</span>
            </div>
            <p className="text-sm text-neutral-600 mt-2">
              ou 12x de R$ 124,92 sem juros
            </p>
            <button className="mt-6 bg-[#A7144C] hover:bg-[#8b1140] text-white px-8 py-3 rounded-full font-semibold text-sm tracking-wide transition-colors">
              COMPRAR AGORA
            </button>
          </div>
        </div>
      </section>

      {/* Mais Vistos */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <SectionTitle title="MAIS VISTOS" subtitle="Este item é o mais popular em nosso Catálogo" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mt-6">
          {maisVistos.map((p) => (
            <ProductCard key={p.nome} p={p} compact />
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <section className="bg-neutral-50 mt-12 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle title="O QUE DIZEM NOSSOS CLIENTES" subtitle="Publicado em Google" center />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {depoimentos.map((d) => (
              <div key={d.nome} className="bg-white rounded-lg p-6 border border-neutral-200">
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
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
            <p className="text-sm opacity-90 mt-1">
              Cadastre seu e-mail e ganhe descontos exclusivos.
            </p>
          </div>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-4 py-3 rounded-md text-neutral-900 outline-none"
            />
            <button className="bg-neutral-900 hover:bg-black px-6 rounded-md font-semibold text-sm">
              CADASTRAR
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300">
        <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <img
              src={`${IMG}/2024/11/logo-ideal-madeiras-mobile.png`}
              alt="Lojas Ideal Madeiras"
              className="h-16 w-auto brightness-0 invert mb-4"
            />
            <p className="text-sm leading-relaxed">
              Loja de Portas, Janelas, Ferragens e Fechaduras em São Paulo. Qualidade
              e o melhor atendimento do mercado.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 grid place-items-center rounded-full border border-neutral-700 hover:bg-[#A7144C] hover:border-[#A7144C]">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 grid place-items-center rounded-full border border-neutral-700 hover:bg-[#A7144C] hover:border-[#A7144C]">
                <Instagram size={16} />
              </a>
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
                <li key={c.nome}>
                  <a href="#" className="hover:text-white">{c.nome.charAt(0) + c.nome.slice(1).toLowerCase()}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-[#A7144C]" />
                <span>Av. Exemplo, 1000 — São Paulo/SP</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#A7144C]" /> (11) 4200-0000
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#A7144C]" /> contato@idealmadeiras.com.br
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle size={16} className="text-[#A7144C]" /> WhatsApp
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

      {/* WhatsApp float */}
      <a
        href="#"
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#1eb659] text-white rounded-full w-14 h-14 grid place-items-center shadow-lg z-50"
        aria-label="WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
  center,
}: {
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
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

function ProductCard({
  p,
  compact,
}: {
  p: { nome: string; preco: string; img: string };
  compact?: boolean;
}) {
  return (
    <div className="group border border-neutral-200 rounded-lg overflow-hidden bg-white hover:shadow-lg hover:border-[#A7144C]/40 transition-all">
      <div className="relative aspect-square bg-neutral-50 overflow-hidden">
        <img
          src={p.img}
          alt={p.nome}
          loading="lazy"
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
        />
        <button
          aria-label="Adicionar à Lista de Desejos"
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 grid place-items-center text-neutral-600 hover:text-[#A7144C] shadow"
        >
          <Heart size={16} />
        </button>
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform">
          <button className="w-full bg-[#A7144C] text-white text-xs font-semibold py-2.5 hover:bg-[#8b1140]">
            VISUALIZAÇÃO RÁPIDA
          </button>
        </div>
      </div>
      <div className={`p-4 ${compact ? "text-center" : ""}`}>
        <h3 className={`font-medium text-neutral-800 ${compact ? "text-xs" : "text-sm"} line-clamp-2 min-h-[2.5rem]`}>
          {p.nome}
        </h3>
        <div className="mt-2 flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill="currentColor" />
          ))}
        </div>
        <div className={`mt-2 font-bold text-[#A7144C] ${compact ? "text-sm" : "text-lg"}`}>
          {p.preco}
        </div>
      </div>
    </div>
  );
}
