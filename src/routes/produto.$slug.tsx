import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight,
  Heart,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
  CreditCard,
  Star,
  Share2,
  Minus,
  Plus,
} from "lucide-react";
import { getProduct, products, WHATSAPP_NUMBER, type Product } from "@/lib/products";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Produto não encontrado - Lojas Ideal Madeiras" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const p = loaderData.product;
    const title = `${p.nome} - Lojas Ideal Madeiras`;
    const desc = `${p.nome} por ${p.preco}. Compre com segurança na Lojas Ideal Madeiras. Entrega para todo o Brasil.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:image", content: p.img },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
  errorComponent: ProductError,
});

function ProductNotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold text-[#A7144C]">Produto não encontrado</h1>
        <p className="mt-2 text-neutral-600">O item que você procura não está disponível.</p>
        <Link to="/" className="inline-block mt-6 bg-[#A7144C] text-white px-6 py-3 rounded-full font-semibold">
          Voltar à página inicial
        </Link>
      </div>
    </div>
  );
}

function ProductError() {
  return (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <p>Ocorreu um erro ao carregar o produto.</p>
    </div>
  );
}

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [imgAtiva, setImgAtiva] = useState(product.galeria[0]);
  const [qtd, setQtd] = useState(1);

  const mensagem = encodeURIComponent(
    `Olá! Tenho interesse no produto: ${product.nome} (${product.preco}). Poderia me passar mais informações?`,
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensagem}`;

  const relacionados = products.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Header simples */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <img
              src="https://idealmadeiras.com.br/wp-content/uploads/2024/09/logo-ideal-madeiras.png"
              alt="Lojas Ideal Madeiras"
              className="h-12 w-auto"
            />
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="hidden md:inline-flex items-center gap-2 text-sm bg-[#25D366] hover:bg-[#1eb659] text-white px-4 py-2 rounded-full font-semibold">
            <MessageCircle size={16} /> Compre pelo WhatsApp
          </a>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-2 text-xs text-neutral-600">
          <Link to="/" className="hover:text-[#A7144C]">Início</Link>
          <ChevronRight size={12} />
          <span>{product.categoria}</span>
          <ChevronRight size={12} />
          <span className="text-neutral-900 font-medium line-clamp-1">{product.nome}</span>
        </div>
      </div>

      {/* Produto */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Galeria */}
          <div>
            <div className="border border-neutral-200 rounded-lg bg-neutral-50 aspect-square overflow-hidden">
              <img src={imgAtiva} alt={product.nome} className="w-full h-full object-contain p-6" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.galeria.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setImgAtiva(g)}
                  className={`border rounded-md overflow-hidden bg-neutral-50 aspect-square transition ${
                    imgAtiva === g ? "border-[#A7144C] ring-2 ring-[#A7144C]/30" : "border-neutral-200 hover:border-[#A7144C]/50"
                  }`}
                >
                  <img src={g} alt={`${product.nome} - imagem ${i + 1}`} className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#A7144C] font-semibold">{product.categoria}</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.nome}</h1>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span className="text-xs text-neutral-500">(28 avaliações)</span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              {product.precoAntigo && (
                <span className="text-neutral-400 line-through">{product.precoAntigo}</span>
              )}
              <span className="text-4xl font-bold text-[#A7144C]">{product.preco}</span>
            </div>
            <p className="text-sm text-neutral-600 mt-1">ou em até 12x sem juros no cartão</p>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center border border-neutral-300 rounded-full">
                <button
                  onClick={() => setQtd(Math.max(1, qtd - 1))}
                  className="w-10 h-10 grid place-items-center text-neutral-600 hover:text-[#A7144C]"
                  aria-label="Diminuir"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{qtd}</span>
                <button
                  onClick={() => setQtd(qtd + 1)}
                  className="w-10 h-10 grid place-items-center text-neutral-600 hover:text-[#A7144C]"
                  aria-label="Aumentar"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button className="flex-1 bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-full font-semibold text-sm">
                COMPRAR AGORA
              </button>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1eb659] text-white px-6 py-3 rounded-full font-semibold text-sm"
            >
              <MessageCircle size={18} /> Falar com um vendedor no WhatsApp
            </a>

            <div className="mt-4 flex items-center gap-4 text-sm text-neutral-600">
              <button className="inline-flex items-center gap-2 hover:text-[#A7144C]">
                <Heart size={16} /> Lista de desejos
              </button>
              <button className="inline-flex items-center gap-2 hover:text-[#A7144C]">
                <Share2 size={16} /> Compartilhar
              </button>
            </div>

            {/* Vantagens */}
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <li className="flex items-center gap-2 border border-neutral-200 rounded-md p-3">
                <Truck size={18} className="text-[#A7144C]" />
                <span>Frete grátis acima de R$ 150</span>
              </li>
              <li className="flex items-center gap-2 border border-neutral-200 rounded-md p-3">
                <CreditCard size={18} className="text-[#A7144C]" />
                <span>Parcelamento em até 12x</span>
              </li>
              <li className="flex items-center gap-2 border border-neutral-200 rounded-md p-3">
                <ShieldCheck size={18} className="text-[#A7144C]" />
                <span>Compra 100% segura</span>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-3 text-sm">
              <Phone size={16} className="text-[#A7144C]" />
              <span>Dúvidas? (11) 4200-0000</span>
            </div>
          </div>
        </div>

        {/* Descrição e especificações */}
        <div className="mt-14 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold border-b-2 border-[#A7144C] pb-2 inline-block">
              Descrição do Produto
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
              {product.descricao}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold border-b-2 border-[#A7144C] pb-2 inline-block">
              Especificações
            </h2>
            <dl className="mt-4 divide-y divide-neutral-200 border border-neutral-200 rounded-md">
              {product.especificacoes.map((e) => (
                <div key={e.label} className="flex justify-between px-4 py-2 text-sm">
                  <dt className="text-neutral-500">{e.label}</dt>
                  <dd className="font-medium text-neutral-900 text-right">{e.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Relacionados */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold">
            <span className="text-[#A7144C]">PRODUTOS</span> RELACIONADOS
          </h2>
          <div className="mt-3 h-0.5 w-16 bg-[#A7144C]" />
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-5">
            {relacionados.map((p) => (
              <Link
                key={p.slug}
                to="/produto/$slug"
                params={{ slug: p.slug }}
                className="group border border-neutral-200 rounded-lg overflow-hidden bg-white hover:shadow-lg hover:border-[#A7144C]/40 transition-all"
              >
                <div className="aspect-square bg-neutral-50 overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.nome}
                    loading="lazy"
                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.nome}</h3>
                  <div className="mt-2 font-bold text-[#A7144C]">{p.preco}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp float */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#1eb659] text-white rounded-full w-14 h-14 grid place-items-center shadow-lg z-50"
        aria-label="WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
    </div>
  );
}
