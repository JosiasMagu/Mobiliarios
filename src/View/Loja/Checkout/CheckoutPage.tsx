// src/View/Loja/Checkout/CheckoutPage.tsx
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@comp/home/Navbar";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";
import { useCheckoutController } from "@controller/Loja/checkout.controller";
import { currency } from "@utils/currency";

export default function CheckoutPage() {
  const ui = useUIStore();
  const cart = useCartStore();
  const nav = useNavigate();

  const c = useCheckoutController();

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

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/cart" className="hover:text-gray-700">Carrinho</Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-700">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Formulário */}
          <section className="space-y-8">
            {/* 1. Identificação */}
            <div className="rounded-xl border border-slate-200/40 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">1. Identificação</h2>
              <div className="mt-4 grid gap-3">
                {!c.guest && (
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Email</span>
                    <input
                      value={c.email}
                      onChange={(e) => c.setEmail(e.target.value)}
                      className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      placeholder="Digite seu email"
                    />
                  </label>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => c.setGuest(false)}
                    className={`px-4 py-2 rounded-md text-sm font-semibold ${
                      c.guest
                        ? "border border-slate-200/60 bg-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => c.setGuest(true)}
                    className={`px-4 py-2 rounded-md text-sm font-semibold ${
                      c.guest
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200/60 bg-white"
                    }`}
                  >
                    Continuar como convidado
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Endereço */}
            <div className="rounded-xl border border-slate-200/40 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">2. Endereço de entrega</h2>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-sm text-gray-600">Endereço</span>
                  <input
                    value={c.street}
                    onChange={(e) => c.setStreet(e.target.value)}
                    className="rounded-md border border-slate-200/60 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    placeholder="Rua, número"
                  />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Cidade</span>
                    <input
                      value={c.city}
                      onChange={(e) => c.setCity(e.target.value)}
                      className="rounded-md border border-slate-200/60 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      placeholder="Cidade"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Estado</span>
                    <input
                      value={c.state}
                      onChange={(e) => c.setState(e.target.value)}
                      className="rounded-md border border-slate-200/60 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      placeholder="Estado"
                    />
                  </label>
                </div>
                <label className="grid gap-1">
                  <span className="text-sm text-gray-600">CEP</span>
                  <input
                    value={c.zip}
                    onChange={(e) => c.setZip(e.target.value)}
                    className="rounded-md border border-slate-200/60 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    placeholder="CEP"
                  />
                </label>
              </div>
            </div>

            {/* 3. Método de envio */}
            <div className="rounded-xl border border-slate-200/40 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">3. Método de envio</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {c.methods.map((m) => (
                  <label
                    key={m.code}
                    className={`flex items-center justify-between gap-3 rounded-md border px-3 py-3 cursor-pointer ${
                      c.ship === m.code
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200/60 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={c.ship === m.code}
                        onChange={() => c.setShip(m.code)}
                        className="accent-blue-600"
                      />
                      <div className="text-sm">
                        <div className="font-medium">{m.label}</div>
                        <div className="text-gray-500">{m.eta}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      {m.cost === 0 ? "Grátis" : currency(m.cost)}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Pagamento */}
            <div className="rounded-xl border border-slate-200/40 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">4. Pagamento</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {([
                  { code: "card", label: "Cartão de Crédito" },
                  { code: "boleto", label: "Boleto" },
                  { code: "transfer", label: "Transferência Bancária" },
                  { code: "pix", label: "Pix" },
                ] as const).map((p) => (
                  <label
                    key={p.code}
                    className={`flex items-center gap-2 rounded-md border px-3 py-3 cursor-pointer ${
                      c.pay === p.code
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200/60 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={c.pay === p.code}
                      onChange={() => c.setPay(p.code)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Resumo */}
          <aside className="rounded-xl border border-slate-200/40 bg-white p-5 h-fit shadow-sm">
            <h2 className="text-lg font-semibold">5. Resumo do pedido</h2>
            <div className="mt-4 space-y-3">
              {c.items.map((it) => (
                <div key={it.productId} className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/40">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.image ?? "/placeholder.jpg"}
                      alt={it.name}
                      className="w-14 h-14 rounded-md object-cover border border-slate-200/60"
                      loading="lazy"
                    />
                    <div className="text-sm">
                      <div className="font-medium line-clamp-1 max-w-[180px]">{it.name}</div>
                      <div className="text-gray-500">Qtd: {it.qty}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{currency(it.price * it.qty)}</div>
                </div>
              ))}

              <div className="pt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{currency(c.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-medium">
                    {c.shippingCost === 0 ? "Grátis" : currency(c.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-base border-t border-slate-200/40 pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-extrabold">{currency(c.total)}</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  const r = await c.submit();
                  if (r.ok && r.orderId) nav(`/order/${r.orderId}/success`);
                  else alert(r.error ?? "Falha ao finalizar.");
                }}
                disabled={!c.canSubmit}
                className="mt-3 w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 disabled:opacity-50"
              >
                Finalizar compra
              </button>
              <Link
                to="/cart"
                className="w-full inline-flex items-center justify-center rounded-md border border-slate-200/60 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5"
              >
                Voltar ao carrinho
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
