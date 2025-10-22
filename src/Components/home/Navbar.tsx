import { Menu, Search, ShoppingCart, User, X, Heart } from "lucide-react";
import { Link } from "react-router-dom";

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
  const onClickSection = (id: string) => {
    smoothScrollTo(id);
    setMenuOpen(false);
  };

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
          <button onClick={() => onClickSection('home')} className="flex items-center gap-3 py-3">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center text-white font-bold">
              M
            </div>
            <div className="text-left">
              <div className="text-lg font-extrabold leading-none tracking-tight">Mobiliário</div>
              <div className="text-[10px] text-slate-500 -mt-0.5">Casa & Escritório</div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-6">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => onClickSection(s.id)}
                className={`text-sm font-medium transition-colors pb-3 border-b-2 ${
                  active === s.id
                    ? "text-blue-700 border-blue-700"
                    : "text-slate-600 hover:text-slate-900 border-transparent"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
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

            <Link to="/wishlist" className="relative p-2 rounded-md hover:bg-slate-100" aria-label="Favoritos">
              <Heart className="w-5 h-5" />
              {!!wishlistCount && (
                <span className="absolute -top-1 -right-1 text-[10px] min-w-[18px] h-[18px] px-1 rounded-full bg-pink-600 text-white grid place-items-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 rounded-md hover:bg-slate-100" aria-label="Carrinho">
              <ShoppingCart className="w-5 h-5" />
              {!!cartCount && (
                <span className="absolute -top-1 -right-1 text-[10px] min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white grid place-items-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/account" className="p-2 rounded-md hover:bg-slate-100" aria-label="Conta">
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-slate-100"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white/95 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.05)]">
          <div className="max-w-7xl mx-auto px-4 py-3 grid gap-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => onClickSection(s.id)}
                className={`w-full text-left px-2 py-3 rounded-md ${
                  active === s.id ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                }`}
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
                className="rounded-md border border-slate-200/60 px-3 py-2 text-center text-sm hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                Carrinho
              </Link>
              <Link
                to="/account"
                className="rounded-md border border-slate-200/60 px-3 py-2 text-center text-sm hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
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
