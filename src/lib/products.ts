const IMG = "https://idealmadeiras.com.br/wp-content/uploads";

export type Product = {
  slug: string;
  nome: string;
  preco: string;
  precoAntigo?: string;
  categoria: string;
  img: string;
  galeria: string[];
  descricao: string;
  especificacoes: { label: string; valor: string }[];
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}


const base: Array<Omit<Product, "slug" | "galeria" | "descricao" | "especificacoes"> & {
  galeria?: string[];
  descricao?: string;
  especificacoes?: { label: string; valor: string }[];
}> = [
  {
    nome: "Porta de Correr 03 Folhas Panorâmica com Almofada Especial",
    preco: "R$ 3.499,00",
    categoria: "Portas",
    img: `${IMG}/2024/10/PORTA-DE-CORRER-03-FOLHAS-PANORAMICA-COM-ALMOFADA-ESPECIAL-800x800.png`,
  },
  {
    nome: "Porta Maciça Paris Cedro Arana",
    preco: "R$ 1.290,00",
    categoria: "Portas",
    img: `${IMG}/2021/08/PORTA-MACICA-PARIS-CEDRO-ARANA-800x800.png`,
  },
  {
    nome: "Conjunto Renolit Branco com Demolição",
    preco: "R$ 2.750,00",
    categoria: "Portas",
    img: `${IMG}/2021/08/CONJUNTO-RENOLIT-BRANCO-COM-DEMOLICAO-800x800.png`,
  },
  {
    nome: "Conjunto Pivotante Painel Clean Cedro Arana",
    preco: "R$ 3.190,00",
    categoria: "Portas",
    img: `${IMG}/2024/10/CONJUNTO-PIVOTANTE-COM-PAINEL-CLEAN-CEDRO-ARANA-800x800.png`,
  },
  {
    nome: "Conjunto Pivotante Mexicana Horizontal com Visor Curvo",
    preco: "R$ 3.590,00",
    categoria: "Portas",
    img: `${IMG}/2021/08/CONJUNTO-PIVOTANTE-MEXICANA-HORIZONTAL-COM-VISOR-CURVO-CEDRO-ARANA-800x800.png`,
  },
  {
    nome: "Conjunto Pivotante Suíça Cedro Arana",
    preco: "R$ 2.990,00",
    categoria: "Portas",
    img: `${IMG}/2021/08/CONJUNTO-PIVOTANTE-SUICA-CEDRO-ARANA-800x800.png`,
  },
  {
    nome: "Par de Puxadores 733 Verona Inox Cromado 100cm",
    preco: "R$ 489,00",
    categoria: "Puxadores",
    img: `${IMG}/2024/11/PAR-DE-PUXADORES-733-VERONA-INOX-CROMADO-100CM-800x800.png`,
  },
  {
    nome: "Fechadura Pado Bico de Papagaio Duplo Externa Escovada",
    preco: "R$ 349,00",
    categoria: "Fechaduras",
    img: `${IMG}/2026/01/FECHADURA-PADO-BICO-DE-PAPAGAIO-DUPLO-EXTERNA-ESCOVADA.png`,
  },
  {
    nome: "Fechadura Odin Cromo Acetinado Imab",
    preco: "R$ 299,00",
    categoria: "Fechaduras",
    img: `${IMG}/2024/11/FECHADURA-ODIN-CROMO-ACETINADO-IMAB-1-800x800.png`,
  },
  {
    nome: "Piso Pronto de Madeira Maciça Tauari",
    preco: "R$ 219,00",
    categoria: "Pisos",
    img: `${IMG}/2024/11/PISO-PRONTO-DE-MADEIRA-MACICA-TAUARI-800x800.png`,
  },
  {
    nome: "Puxador Alumínio Concha de Embutir Preto",
    preco: "R$ 89,00",
    categoria: "Puxadores",
    img: `${IMG}/2024/11/PUXADOR-ALUMINIO-CONCHA-DE-EMBUTIR-PRETO-1-800x800.png`,
  },
  {
    nome: "Fechadura Bico Papagaio Cilindro Duplo Preta",
    preco: "R$ 319,00",
    categoria: "Fechaduras",
    img: `${IMG}/2024/11/FECHADURA-BICO-PAPAGAIO-CILINDRO-DUPLO-PRETA-800x800.png`,
  },
  {
    nome: "Fechadura Rolete com Lingueta Preta Redonda Arouca",
    preco: "R$ 189,00",
    categoria: "Fechaduras",
    img: `${IMG}/2024/11/FECHADURA-ROLETE-COM-LINGUETA-PRETA-REDONDA-AROUCA-800x800.png`,
  },
  {
    nome: "Par de Levantador para Janela",
    preco: "R$ 79,00",
    categoria: "Acessórios",
    img: `${IMG}/2024/11/PAR-DE-LEVANTADOR-PARA-JANELA-800x800.png`,
  },
  {
    nome: "Fechadura Pado Digital 800 Vision",
    preco: "R$ 1.499,00",
    precoAntigo: "R$ 1.899,00",
    categoria: "Fechaduras",
    img: `${IMG}/2026/01/FECHADURA-PADO-DIGITAL-800-VISION-5-800x800.png`,
  },
];

export const products: Product[] = base.map((p) => {
  const slug = slugify(p.nome);
  return {
    ...p,
    slug,
    galeria: p.galeria ?? [p.img, p.img, p.img, p.img],
    descricao:
      p.descricao ??
      `${p.nome} — produto de alta qualidade, com acabamento premium e garantia de fábrica. Ideal para quem busca durabilidade, design e sofisticação para sua obra ou reforma. Enviamos para todo o Brasil com embalagem reforçada e suporte especializado da equipe Lojas Ideal Madeiras.`,
    especificacoes: p.especificacoes ?? [
      { label: "Categoria", valor: p.categoria },
      { label: "Marca", valor: "Ideal Madeiras" },
      { label: "Garantia", valor: "12 meses de fábrica" },
      { label: "Origem", valor: "Nacional" },
      { label: "Condição", valor: "Produto novo" },
    ],
  };
});

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const WHATSAPP_NUMBER = "5511942000000";
