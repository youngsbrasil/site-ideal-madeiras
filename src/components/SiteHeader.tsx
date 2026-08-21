import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Search, User, Heart, ShoppingCart, Phone, Facebook, Instagram, Tag, Package as PackageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchCategories, fetchSettings, fetchAnnouncements, proxyImg, productPath } from "@/lib/site-data";
import { fetchSuggestions, type Suggestion } from "@/lib/search";

const LOGO = "https://idealmadeiras.com.br/wp-content/uploads/2024/09/logo-ideal-madeiras.png";

export function SiteHeader() {
  const { data: categorias = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: announcements = [] } = useQuery({ queryKey: ["announcements"], queryFn: fetchAnnouncements });
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [open, setOpen] = useState(false);
  const [debounced, setDebounced] = useState("");
  const boxRef = useRef<HTMLFormElement | null>(null);

  const [annIdx, setAnnIdx] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const id = setInterval(() => setAnnIdx((i) => (i + 1) % announcements.length), 5000);
    return () => clearInterval(id);
  }, [announcements.length]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 200);
    return () => clearTimeout(t);
  }, [q]);
...
  const telefone = settings?.site.telefone || "(11) 4200-0000";
  const whatsapp = (settings?.site.whatsapp || "5511942000000").replace(/\D/g, "");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (categoria && !q.trim()) {
      navigate({ to: "/categoria/$slug", params: { slug: categoria } });
      return;
    }
    navigate({ to: "/busca", search: { q: q.trim(), categoria } });
  };

  const pickSuggestion = (s: Suggestion) => {
    setOpen(false);
    setQ("");
    if (s.kind === "category") {
      navigate({ to: "/categoria/$slug", params: { slug: s.slug } });
    } else {
      const path = productPath({ slug: s.slug } as any, categorias);
      navigate({ to: path as any });
    }
  };

  return (
    <>
      {/* Announcements Bar */}
      {announcements.length > 0 ? (
        <div 
          className="text-white text-xs relative overflow-hidden transition-colors duration-500"
          style={{ backgroundColor: announcements[annIdx]?.cor_fundo || "#A7144C" }}
        >
          <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex-1 flex justify-center md:justify-start items-center gap-2 overflow-hidden">
              <a 
                href={announcements[annIdx].link_url || "#"} 
                className={`tracking-wide truncate hover:underline ${announcements[annIdx].cor_texto ? "" : "text-white"}`}
                style={announcements[annIdx].cor_texto ? { color: announcements[annIdx].cor_texto } : {}}
              >
                {announcements[annIdx].texto}
              </a>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <a href={`tel:${telefone.replace(/\D/g, "")}`} className="hover:underline flex items-center gap-1">
                <Phone size={12} /> {telefone}
              </a>
              <a href="#" className="hover:underline flex items-center gap-1"><Facebook size={14} /></a>
              <a href="#" className="hover:underline flex items-center gap-1"><Instagram size={14} /></a>
            </div>
          </div>
          {announcements.length > 1 && (
            <>
              <button 
                onClick={() => setAnnIdx((i) => (i - 1 + announcements.length) % announcements.length)}
                className="absolute left-1 top-1/2 -translate-y-1/2 p-1 opacity-50 hover:opacity-100 md:hidden"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={() => setAnnIdx((i) => (i + 1) % announcements.length)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 opacity-50 hover:opacity-100 md:hidden"
              >
                <ChevronRight size={14} />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-[#A7144C] text-white text-xs">
          <div className="mx-auto max-w-7xl px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <span className="tracking-wide">LOJAS IDEAL MADEIRAS — QUALIDADE E TRADIÇÃO</span>
            <div className="hidden md:flex items-center gap-4">
              <a href={`tel:${telefone.replace(/\D/g, "")}`} className="hover:underline flex items-center gap-1"><Phone size={12} /> {telefone}</a>
              <a href="#" className="hover:underline flex items-center gap-1"><Facebook size={14} /></a>
              <a href="#" className="hover:underline flex items-center gap-1"><Instagram size={14} /></a>
            </div>
          </div>
        </div>
      )}

      {/* Header sticky */}
      <header className="sticky top-0 z-50 shadow-sm">
        <div className="bg-[#0b1a34] text-white">
          <div className="mx-auto max-w-7xl px-4 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-4">
            <Link to="/" className="shrink-0">
              <img src={proxyImg(LOGO)} alt="Lojas Ideal Madeiras" className="h-14 w-auto" />
            </Link>

            <form className="min-w-0 relative" onSubmit={onSubmit} ref={boxRef}>
              <div className="flex items-stretch rounded-full bg-white overflow-hidden h-11">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setOpen(true); }}
                  onFocus={() => setOpen(true)}
                  placeholder="Buscar produtos"
                  className="flex-1 min-w-0 px-5 text-sm text-neutral-800 outline-none"
                  autoComplete="off"
                />
                <div className="hidden md:flex items-center border-l border-neutral-200 px-3">
                  <select
                    className="bg-transparent text-xs font-semibold text-neutral-700 outline-none pr-1 max-w-[140px] truncate"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
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

              {open && debounced.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white text-neutral-800 rounded-lg shadow-2xl border border-neutral-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
                  {suggestions.length === 0 ? (
                    <div className="p-4 text-sm text-neutral-500">
                      Nenhuma sugestão. Pressione Enter para buscar por “{debounced}”.
                    </div>
                  ) : (
                    <ul className="divide-y divide-neutral-100">
                      {suggestions.map((s) => (
                        <li key={`${s.kind}-${s.id}`}>
                          <button
                            type="button"
                            onClick={() => pickSuggestion(s)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50"
                          >
                            {s.kind === "product" ? (
                              <img
                                src={s.image ? proxyImg(s.image) : "/placeholder.svg"}
                                alt=""
                                className="w-10 h-10 object-cover rounded bg-neutral-100 shrink-0"
                              />
                            ) : (
                              <span className="w-10 h-10 grid place-items-center bg-[#f59318]/10 text-[#f59318] rounded shrink-0">
                                <Tag size={16} />
                              </span>
                            )}
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium truncate">{s.name}</span>
                              <span className="block text-[11px] text-neutral-500 flex items-center gap-1">
                                {s.kind === "product" ? <><PackageIcon size={10} /> Produto {s.price ? `· ${s.price}` : ""}</> : "Categoria"}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                      <li>
                        <button
                          type="submit"
                          onClick={onSubmit}
                          className="w-full text-center text-xs font-semibold px-3 py-2 bg-neutral-50 text-[#A7144C] hover:bg-neutral-100"
                        >
                          Ver todos os resultados para “{debounced}”
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </form>

            <div className="flex items-center gap-5 md:gap-6">
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
              {categorias.filter((c) => !c.parent_id).map((c) => {
                const subs = categorias.filter((s) => s.parent_id === c.id);
                return (
                  <li key={c.id} className="relative group">
                    <Link
                      to="/categoria/$slug"
                      params={{ slug: c.slug }}
                      className="hover:text-[#f59318] transition-colors inline-flex items-center gap-1"
                      activeProps={{ className: "text-[#f59318]" }}
                    >
                      {c.name}
                      {subs.length > 0 && <span className="text-[9px]">▼</span>}
                    </Link>
                    {subs.length > 0 && (
                      <ul className="absolute left-0 top-full min-w-[220px] bg-white border border-neutral-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 py-2">
                        {subs.map((s) => (
                          <li key={s.id}>
                            <Link
                              to="/categoria/$slug"
                              params={{ slug: s.slug }}
                              className="block px-4 py-2 text-xs hover:bg-neutral-100 hover:text-[#f59318] normal-case font-medium"
                            >
                              {s.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}
