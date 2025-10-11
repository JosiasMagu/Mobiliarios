// src/View/Loja/Cart/CartPage.tsx
import { Link } from "react-router-dom";
import { Navbar } from "@comp/home/Navbar";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";
import { currency } from "@utils/currency";
import { Trash2, Minus, Plus } from "lucide-react";

export default function CartPage() {
  const cart = useCartStore();
  const ui = useUIStore();

  const items = cart.items;
  const subtotal = cart.subtotal;
  const totalQty = cart.totalQty;
  const wishlistCount = cart.wishlistCount;

  const menuOpen = ui.menuOpen;
  const setMenuOpenProp = (v: boolean) => {
    const anyStore = ui as any;
    if (typeof anyStore.setMenuOpen === "function") {
      if (anyStore.setMenuOpen.length >= 1) anyStore.setMenuOpen(v);
      else anyStore.setMenuOpen();
    } else if (typeof anyStore.toggleMenu === "function") {
      if (!!menuOpen !== !!v) anyStore.toggleMenu();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        sections={[]}
        active=""
        cartCount={totalQty}
        wishlistCount={wishlistCount}
        searchQuery=""
        setSearchQuery={() => {}}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpenProp}
        smoothScrollTo={() => {}}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-700">Carrinho</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Lista */}
          <section className="space-y-3">
            {items.length === 0 ? (
              <div className="rounded-xl border border-slate-200/40 bg-white p-8 text-center text-gray-600 shadow-sm">
                Seu carrinho está vazio.{" "}
                <Link to="/" className="text-blue-700 font-semibold hover:underline">Continuar comprando</Link>
              </div>
            ) : (
              items.map((it) => (
                <div
                  key={it.productId}
                  className="rounded-xl border border-slate-200/40 bg-white p-4 sm:p-5 flex items-center gap-4 shadow-sm"
                >
                  <img
                    src={it.image ?? "/placeholder.jpg"}
                    alt={it.name}
                    className="w-20 h-20 rounded-md object-cover border border-slate-200/60"
                    loading="lazy"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 line-clamp-1">{it.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{currency(it.price)}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cart.setQty(it.productId, it.qty - 1)}
                      className="h-8 w-8 grid place-items-center rounded-md border border-slate-200/60 hover:bg-gray-50 transition-colors"
                      aria-label="Diminuir"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="w-8 text-center">{it.qty}</div>
                    <button
                      onClick={() => cart.setQty(it.productId, it.qty + 1)}
                      className="h-8 w-8 grid place-items-center rounded-md border border-slate-200/60 hover:bg-gray-50 transition-colors"
                      aria-label="Aumentar"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="w-24 text-right font-semibold">
                    {currency(it.price * it.qty)}
                  </div>

                  <button
                    onClick={() => cart.removeItem(it.productId)}
                    className="ml-1 p-2 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Remover"
                    title="Remover"
                  >
                    <Trash2 className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              ))
            )}
          </section>

          {/* Resumo */}
          <aside className="rounded-xl border border-slate-200/40 bg-white p-5 h-fit shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Resumo do Pedido</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Entrega</span>
                <span className="text-emerald-600 font-medium">Grátis</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/40 pb-3">
                <span className="text-gray-600">Impostos</span>
                <span className="text-gray-500">Calculado no checkout</span>
              </div>
              <div className="flex justify-between text-base pt-1">
                <span className="font-semibold">Total</span>
                <span className="font-extrabold">{currency(subtotal)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              aria-disabled={items.length === 0}
              className={`mt-5 w-full inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 transition-colors ${
                items.length === 0 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Prosseguir para o Checkout
            </Link>

            <Link
              to="/"
              className="mt-3 w-full inline-flex items-center justify-center rounded-md border border-slate-200/60 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 transition-colors"
            >
              Continuar comprando
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
