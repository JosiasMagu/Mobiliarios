import { useParams, Link } from "react-router-dom";
import { Navbar } from "@comp/home/Navbar";
import { Footer } from "@comp/layout/footer";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";
import { getOrder } from "@repo/order.repository";
import { currency } from "@utils/currency";

export default function OrderDetailPage() {
  const { id = "" } = useParams();
  const o = getOrder(id);
  const cart = useCartStore(); const ui = useUIStore();

  const setMenuOpenProp = (v: boolean) => {
    const anyStore = ui as any; const isOpen = !!ui.menuOpen;
    if (typeof anyStore.setMenuOpen === "function") (anyStore.setMenuOpen.length ? anyStore.setMenuOpen(v) : anyStore.setMenuOpen());
    else if (typeof anyStore.toggleMenu === "function" && isOpen !== !!v) anyStore.toggleMenu();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        sections={[]} active=""
        cartCount={cart.totalQty} wishlistCount={cart.wishlistCount}
        searchQuery="" setSearchQuery={() => {}}
        menuOpen={ui.menuOpen} setMenuOpen={setMenuOpenProp}
        smoothScrollTo={() => {}}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/account" className="hover:text-gray-700">Conta</Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-700">Pedido #{id}</span>
        </div>

        {!o ? (
          <div className="rounded-xl border border-slate-200/40 bg-white p-8 text-center text-gray-600 shadow-sm">
            Pedido não encontrado. <Link to="/account" className="text-blue-700 font-semibold">Voltar</Link>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200/40 bg-white shadow-sm">
            <div className="p-6 border-b border-slate-200/40">
              <h1 className="text-2xl font-bold">Pedido #{o.id}</h1>
              <div className="text-sm text-slate-600 mt-1">Criado em {new Date(o.createdAt).toLocaleString()}</div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Itens</h2>
                <div className="rounded-lg border border-slate-200/40">
                  {o.items.map((it) => (
                    <div key={it.productId} className="flex items-center gap-3 p-3 border-b last:border-b-0 border-slate-200/40">
                      <img src={it.image ?? "/placeholder.jpg"} alt={it.name} className="w-14 h-14 rounded-md object-cover border border-slate-200/60" />
                      <div className="flex-1">
                        <div className="font-medium line-clamp-1">{it.name}</div>
                        <div className="text-xs text-slate-600">Qtd: {it.qty}</div>
                      </div>
                      <div className="text-sm font-semibold">{currency(it.price * it.qty)}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Entrega e pagamento</h2>
                <div className="rounded-lg border border-slate-200/40 p-3">
                  <div className="text-sm"><span className="text-slate-600">Endereço:</span> {o.address.street}, {o.address.city} - {o.address.state} · {o.address.zip}</div>
                  <div className="text-sm mt-1"><span className="text-slate-600">Envio:</span> {o.shippingMethod === "express" ? "Expresso" : "Padrão"}</div>
                  <div className="text-sm mt-1"><span className="text-slate-600">Pagamento:</span> {o.payment.method.toUpperCase()}</div>
                </div>

                <div className="rounded-lg border border-slate-200/40 p-3 space-y-1">
                  <div className="flex justify-between text-sm"><span>Subtotal</span><span>{currency(o.subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span>Frete</span><span>{currency(o.shippingCost)}</span></div>
                  <div className="flex justify-between text-base font-semibold pt-1 border-t border-slate-200/40"><span>Total</span><span>{currency(o.total)}</span></div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
