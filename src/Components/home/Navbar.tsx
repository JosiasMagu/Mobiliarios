import { Menu, Search, ShoppingCart, User, X, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Navbar({
  sections,
  active,
  cartCount,
  wishlistCount,
  searchQuery,
  setSearchQuery,
  menuOpen,
  setMenuOpen,
  smoothScrollTo,
}: {
  sections: readonly { id: string; label: string }[];
  active: string;
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  smoothScrollTo: (id: string) => void;
}) {
  const location = useLocation();

  const onClickSection = (id: string) => {
    smoothScrollTo(id);
    setMenuOpen(false);
  };

  // destaca ícones quando estiver nas rotas correspondentes
  const isPath = (p: string) => location.pathname.startsWith(p);

  return (
    <header
      className="
        sticky top-0 z-40
        bg-white/85 supports-[backdrop-filter]:bg-white/70 backdrop-blur
        shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.05)]
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand: usa imagem em /public/logo/* com fallback */}
          <Link to="/" className="flex items-center gap-3 py-3">
            <picture className="inline-block">
              {/* se existir .svg, o browser usa; senão cai no png/webp */}
              <source srcSet="public/logo.jpeg" type="image/svg+xml" />
              <source srcSet="public/logo.jpeg" type="image/webp" />
              <img
                src="public/logo.jpeg"
                alt="Mobiliário"
                className="h-13 w-15 rounded-md"
                loading="eager"
                decoding="async"
              />
            </picture>
            <div className="text-left">
              <div className="text-lg font-extrabold leading-none tracking-tight">Mobiliário</div>
              <div className="text-[10px] text-slate-500 -mt-0.5">Casa & Escritório</div>
            </div>
          </Link>

          {/* Nav seções (scroll-spy controlado via prop `active`) */}
          <nav className="hidden md:flex items-center gap-6">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => onClickSection(s.id)}
                aria-current={active === s.id ? "page" : undefined}
                className={`relative text-sm font-medium transition-colors pb-3
                  ${active === s.id ? "text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
              >
                {s.label}
                <span
                  className={`absolute left-0 right-0 -bottom-[2px] h-[2px] rounded-full transition-transform ${
                    active === s.id ? "bg-blue-700 scale-x-100" : "bg-transparent scale-x-0"
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* Ações à direita */}
          <div className="flex items-center gap-2">
            {/* Busca desktop */}
            <div className="relative hidden lg:block group transition-[width] duration-300 ease-out w-56 focus-within:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar produtos..."
                className="w-full rounded-lg border border-slate-200/40 bg-slate-50 pl-9 pr-8 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label="Pesquisar"
              />
            </div>

            {/* Favoritos */}
            <Link
              to="/wishlist"
              className={`relative p-2 rounded-md hover:bg-slate-100 ${
                isPath("/wishlist") ? "text-pink-600" : ""
              }`}
              aria-label="Favoritos"
              aria-current={isPath("/wishlist") ? "page" : undefined}
            >
              <Heart className="w-5 h-5" />
              {!!wishlistCount && (
                <span className="absolute -top-1 -right-1 text-[10px] min-w-[18px] h-[18px] px-1 rounded-full bg-pink-600 text-white grid place-items-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Carrinho */}
            <Link
              to="/cart"
              className={`relative p-2 rounded-md hover:bg-slate-100 ${
                isPath("/cart") ? "text-blue-600" : ""
              }`}
              aria-label="Carrinho"
              aria-current={isPath("/cart") ? "page" : undefined}
            >
              <ShoppingCart className="w-5 h-5" />
              {!!cartCount && (
                <span className="absolute -top-1 -right-1 text-[10px] min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white grid place-items-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Conta */}
            <Link
              to="/account"
              className={`p-2 rounded-md hover:bg-slate-100 ${
                isPath("/account") ? "text-blue-700" : ""
              }`}
              aria-label="Conta"
              aria-current={isPath("/account") ? "page" : undefined}
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Menu mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-slate-100"
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="md:hidden bg-white/95 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.05)]"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 grid gap-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => onClickSection(s.id)}
                className={`w-full text-left px-2 py-3 rounded-md ${
                  active === s.id ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                }`}
                aria-current={active === s.id ? "page" : undefined}
              >
                {s.label}
              </button>
            ))}

            <div className="pt-2">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar produtos..."
                  className="w-full rounded-md border border-slate-200/40 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3">
              <Link
                to="/cart"
                className={`rounded-md border border-slate-200/60 px-3 py-2 text-center text-sm hover:bg-gray-50 ${
                  isPath("/cart") ? "text-blue-600 border-blue-200" : ""
                }`}
                onClick={() => setMenuOpen(false)}
                aria-current={isPath("/cart") ? "page" : undefined}
              >
                Carrinho
              </Link>
              <Link
                to="/account"
                className={`rounded-md border border-slate-200/60 px-3 py-2 text-center text-sm hover:bg-gray-50 ${
                  isPath("/account") ? "text-blue-700 border-blue-200" : ""
                }`}
                onClick={() => setMenuOpen(false)}
                aria-current={isPath("/account") ? "page" : undefined}
              >
                Minha conta
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
