import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, User, Heart, ShoppingCart, Phone, Facebook, Instagram } from "lucide-react";
import { fetchCategories, fetchSettings, proxyImg } from "@/lib/site-data";

const LOGO = "https://idealmadeiras.com.br/wp-content/uploads/2024/09/logo-ideal-madeiras.png";

export function SiteHeader() {
  const { data: categorias = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");

  const topbarText = settings?.topbar.texto || "FRETE GRÁTIS PARA TODOS OS PEDIDOS ACIMA DE R$ 150";
  const telefone = settings?.site.telefone || "(11) 4200-0000";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoria && !q.trim()) {
      navigate({ to: "/categoria/$slug", params: { slug: categoria } });
      return;
    }
    navigate({ to: "/busca", search: { q: q.trim(), categoria } });
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#A7144C] text-white text-xs">
        <div className="mx-auto max-w-7xl px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <span className="tracking-wide">{topbarText}</span>
          <div className="hidden md:flex items-center gap-4">
            <a href={`tel:${telefone}`} className="hover:underline flex items-center gap-1"><Phone size={12} /> {telefone}</a>
            <a href="#" className="hover:underline flex items-center gap-1"><Facebook size={14} /></a>
            <a href="#" className="hover:underline flex items-center gap-1"><Instagram size={14} /></a>
          </div>
        </div>
      </div>

      {/* Header sticky */}
      <header className="sticky top-0 z-50 shadow-sm">
        <div className="bg-[#0b1a34] text-white">
          <div className="mx-auto max-w-7xl px-4 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-4">
            <Link to="/" className="shrink-0">
              <img src={proxyImg(LOGO)} alt="Lojas Ideal Madeiras" className="h-14 w-auto" />
            </Link>

            <form className="min-w-0">
              <div className="flex items-stretch rounded-full bg-white overflow-hidden h-11">
                <input
                  type="text"
                  placeholder="Buscar produtos"
                  className="flex-1 min-w-0 px-5 text-sm text-neutral-800 outline-none"
                />
                <div className="hidden md:flex items-center border-l border-neutral-200 px-3">
                  <select
                    className="bg-transparent text-xs font-semibold text-neutral-700 outline-none pr-1 max-w-[140px] truncate"
                    defaultValue=""
                    aria-label="Categoria"
                  >
                    <option value="">SELECIONE A CATEGORIA</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  aria-label="Buscar"
                  className="bg-[#f59318] hover:bg-[#e08210] text-white px-5 flex items-center justify-center transition-colors"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-5 md:gap-6">
              <Link to="/auth" className="hidden sm:flex items-center gap-2 text-xs font-bold tracking-wide hover:text-[#f59318]">
                <User size={20} />
                <span>ENTRAR / REGISTRAR</span>
              </Link>
              <a href="#" aria-label="Lista de desejos" className="hover:text-[#f59318]">
                <Heart size={22} />
              </a>
              <a href="#" aria-label="Carrinho" className="relative flex items-center gap-2 hover:text-[#f59318]">
                <span className="relative">
                  <ShoppingCart size={22} />
                  <span className="absolute -top-2 -right-2 bg-[#f59318] text-white text-[10px] font-bold rounded-full w-4 h-4 grid place-items-center">0</span>
                </span>
                <span className="hidden md:inline text-sm font-semibold">R$ 0,00</span>
              </a>
            </div>
          </div>
        </div>

        <nav className="bg-white border-b border-neutral-200">
          <div className="mx-auto max-w-7xl px-4">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-3 text-[13px] font-bold tracking-wide uppercase text-neutral-800">
              {categorias.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/categoria/$slug"
                    params={{ slug: c.slug }}
                    className="hover:text-[#f59318] transition-colors"
                    activeProps={{ className: "text-[#f59318]" }}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}
