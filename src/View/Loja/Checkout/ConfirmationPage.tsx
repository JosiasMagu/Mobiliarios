// src/View/Loja/Checkout/ConfirmationPage.tsx
import { Link, useParams } from "react-router-dom";
import { Navbar } from "@comp/home/Navbar";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";

export default function ConfirmationPage() {
  const { id } = useParams();
  const ui = useUIStore();
  const cart = useCartStore();

  const setMenuOpenProp = (v: boolean) => {
    const anyStore = ui as any;
    if (typeof anyStore.setMenuOpen === "function") {
      if (anyStore.setMenuOpen.length >= 1) anyStore.setMenuOpen(v);
      else anyStore.setMenuOpen();
    } else if (typeof anyStore.toggleMenu === "function") {
      if (!!ui.menuOpen !== !!v) anyStore.toggleMenu();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        sections={[]}
        active=""
        cartCount={cart.totalQty}
        wishlistCount={cart.wishlistCount}
        searchQuery=""
        setSearchQuery={() => {}}
        menuOpen={ui.menuOpen}
        setMenuOpen={setMenuOpenProp}
        smoothScrollTo={() => {}}
      />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
        <div className="mx-auto max-w-xl rounded-xl border border-slate-200/40 bg-white p-10 shadow-sm">
          <h1 className="text-2xl font-extrabold">Pedido confirmado</h1>
          <p className="mt-2 text-gray-600">Número do pedido</p>
          <p className="text-lg font-mono font-semibold mt-1">{id}</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5"
          >
            Voltar à loja
          </Link>
        </div>
      </main>
    </div>
  );
}
