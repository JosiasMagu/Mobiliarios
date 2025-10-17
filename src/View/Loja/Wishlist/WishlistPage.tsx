import { Link } from "react-router-dom";
import { Navbar } from "@comp/home/Navbar";
import { Footer } from "@comp/layout/footer";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";
import { useWishlistStore } from "@state/wishlist.store";
import { currency } from "@utils/currency";
import { Trash2, ShoppingCart } from "lucide-react";

export default function WishlistPage() {
  const cart = useCartStore();
  const wl = useWishlistStore();
  const ui = useUIStore();

  const setMenuOpenProp = (v: boolean) => {
    const anyStore = ui as any;
    const isOpen = !!ui.menuOpen;
    if (typeof anyStore.setMenuOpen === "function") (anyStore.setMenuOpen.length ? anyStore.setMenuOpen(v) : anyStore.setMenuOpen());
    else if (typeof anyStore.toggleMenu === "function" && isOpen !== !!v) anyStore.toggleMenu();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        sections={[]} active=""
        cartCount={cart.totalQty} wishlistCount={wl.items.length}
        searchQuery="" setSearchQuery={() => {}}
        menuOpen={ui.menuOpen} setMenuOpen={setMenuOpenProp}
        smoothScrollTo={() => {}}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-700">Lista de desejos</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">Lista de desejos</h1>

        {wl.items.length === 0 ? (
          <div className="rounded-xl border border-slate-200/40 bg-white p-8 text-center text-gray-600 shadow-sm">
            Sua lista está vazia.{" "}
            <Link to="/" className="text-blue-700 font-semibold hover:underline">Explorar produtos</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wl.items.map((it) => (
              <div key={it.productId} className="rounded-xl border border-slate-200/40 bg-white p-4 shadow-sm">
                <Link to={`/p/${it.productId}`} className="block">
                  <img
                    src={it.image ?? "/placeholder.jpg"}
                    alt={it.name}
                    className="w-full h-44 object-cover rounded-md border border-slate-200/60"
                    loading="lazy"
                  />
                </Link>
                <div className="mt-3 font-semibold line-clamp-1">{it.name}</div>
                <div className="text-sm text-slate-600">{currency(it.price)}</div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => cart.addItem({ productId: it.productId, name: it.name, price: it.price, image: it.image }, 1)}
                    className="flex-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 transition-colors"
                  >
                    <span className="inline-flex items-center gap-1 justify-center"><ShoppingCart className="w-4 h-4" /> Adicionar</span>
                  </button>
                  <button
                    onClick={() => wl.remove(it.productId)}
                    className="px-3 rounded-md border border-slate-200/60 hover:bg-gray-50"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
