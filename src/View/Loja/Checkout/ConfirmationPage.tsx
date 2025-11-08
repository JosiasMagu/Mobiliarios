import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@comp/home/Navbar";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";
import { getOrder } from "@repo/order.repository";

type LocState = {
  orderRef?: string;
  total?: number;
  subtotal?: number;
  shippingCost?: number;
  items?: Array<{ id: string; name: string; qty: number; price: number; image?: string }>;
};

type ViewOrder = {
  id?: string;
  number?: string;
  items: Array<{ productId: number; name: string; price: number; qty: number; image?: string }>;
  subtotal: number;
  shippingCost: number;
  total: number;
};

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const loc = useLocation();
  const st = (loc.state || {}) as LocState;

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

  // preferir dados vindos do state da navegação
  const fromState: ViewOrder | null = useMemo(() => {
    if (st.items && st.total != null) {
      return {
        id,
        number: st.orderRef || `#${id}`,
        items: st.items.map((i) => ({
          productId: Number(i.id),
          name: i.name,
          price: i.price,
          qty: i.qty,
          image: i.image,
        })),
        subtotal: st.subtotal ?? 0,
        shippingCost: st.shippingCost ?? 0,
        total: st.total ?? 0,
      };
    }
    return null;
  }, [id, st]);

  const [ord, setOrd] = useState<ViewOrder | null>(fromState);

  useEffect(() => {
    if (fromState || !id) return;
    let alive = true;
    (async () => {
      try {
        const o = await getOrder(id);
        if (!alive || !o) return;
        setOrd({
          id: o.id,
          number: o.number,
          items: o.items.map((i: any) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            qty: i.qty,
            image: i.image,
          })),
          subtotal: o.subtotal,
          shippingCost: o.shippingCost,
          total: o.total,
        });
      } catch {
        if (alive) setOrd(null);
      }
    })();
    return () => { alive = false; };
  }, [fromState, id]);

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

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-xl rounded-xl border border-slate-200/40 bg-white p-8 md:p-10 shadow-sm text-center">
          {ord ? (
            <>
              <h1 className="text-2xl font-extrabold">Pedido confirmado</h1>
              <p className="mt-2 text-gray-600">Número do pedido</p>
              <p className="text-lg font-mono font-semibold mt-1">{ord.number}</p>

              <div className="mt-6 text-left text-sm text-slate-700">
                <div className="border-t pt-4 space-y-2">
                  {ord.items.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate">
                        {it.name} × {it.qty}
                      </span>
                      <span>{(it.price * it.qty).toFixed(2)} MZN</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t pt-3 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{ord.subtotal.toFixed(2)} MZN</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envio</span>
                    <span>{ord.shippingCost.toFixed(2)} MZN</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{ord.total.toFixed(2)} MZN</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold">Pedido não encontrado</h1>
              <p className="mt-2 text-gray-600">Verifique o link ou finalize um novo pedido.</p>
            </>
          )}

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
