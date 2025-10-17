// src/View/Loja/Checkout/CheckoutPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/Components/home/Navbar";
import { listPaymentMethods, MZ_PHONE_REGEX } from "@/Repository/payment.repository";
import { listShippingRules, estimateZoneCost } from "@/Repository/shipping.repository";
import { useCartStore } from "@state/cart.store";
import { createOrder, type PaymentKind, type ShippingMethod } from "@repo/order.repository";

type Address = {
  nome: string;
  telefone: string;
  provincia: string;
  cidade: string;
  bairro: string;
  referencia?: string;
};

export default function CheckoutPage() {
  const navigate = useNavigate();

  // Carrinho
  const cart = useCartStore();
  const items = cart.items.map(i => ({
    id: String(i.productId),
    name: i.name,
    qty: i.qty,
    price: i.price,
    image: i.image,
  }));

  // Endereço
  const [addr, setAddr] = useState<Address>({
    nome: "",
    telefone: "",
    provincia: "",
    cidade: "",
    bairro: "",
    referencia: "",
  });
  const updateAddr = <K extends keyof Address>(k: K, v: Address[K]) =>
    setAddr(p => ({ ...p, [k]: v }));

  // Pagamento e envio
  const payments = listPaymentMethods(true);
  const shippingRules = listShippingRules(true);

  const [paymentId, setPaymentId] = useState<string>(payments[0]?.id ?? "");
  const [shippingId, setShippingId] = useState<string>(shippingRules[0]?.id ?? "");
  const [zoneCost, setZoneCost] = useState<number | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const payment = useMemo(() => payments.find(p => p.id === paymentId), [payments, paymentId]);
  const shipping: any = useMemo(
    () => shippingRules.find(s => "service" in s && s.id === shippingId),
    [shippingRules, shippingId]
  );

  // Totais
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);
  const shippingCost =
    !shipping ? 0 : shipping.service === "pickup" ? 0 : shipping.service === "zone" ? zoneCost ?? 0 : shipping.baseCost ?? 0;
  const total = subtotal + shippingCost;

  // Navbar
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const sections: ReadonlyArray<{ id: string; label: string }> = [];
  const active = "checkout";
  const cartCount = cart.totalQty ?? items.reduce((n, i) => n + i.qty, 0);
  const wishlistCount = cart.wishlistCount ?? 0;
  const smoothScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Validação
  function validate() {
    const e: Record<string, string> = {};
    if (items.length === 0) e.cart = "Carrinho vazio.";
    if (!addr.nome) e.nome = "Nome obrigatório.";
    if (!addr.telefone) e.telefone = "Telefone obrigatório.";
    else if (!MZ_PHONE_REGEX.test(addr.telefone)) e.telefone = "Telefone inválido.";
    if (shipping?.service !== "pickup") {
      if (!addr.provincia) e.provincia = "Província obrigatória.";
      if (!addr.cidade) e.cidade = "Cidade obrigatória.";
      if (!addr.bairro) e.bairro = "Bairro obrigatório.";
    }
    if (!payment) e.payment = "Selecione um método de pagamento.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Ações
  function onChangeShipping(id: string) {
    setShippingId(id);
    const sel: any = shippingRules.find(r => "service" in r && r.id === id);
    if (sel?.service === "zone" && addr.provincia) {
      setZoneCost(estimateZoneCost(addr.provincia, addr.cidade, addr.bairro));
    } else setZoneCost(undefined);
  }
  function onAddressBlur() {
    const sel: any = shippingRules.find(r => "service" in r && r.id === shippingId);
    if (sel?.service === "zone" && addr.provincia) {
      setZoneCost(estimateZoneCost(addr.provincia, addr.cidade, addr.bairro));
    }
  }

  function placeOrder() {
    if (!validate()) return;

    // Montagem do pedido persistido
    const order = createOrder({
      items: cart.items.map(i => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty, image: i.image })),
      subtotal,
      shippingMethod: (shipping?.service ?? "standard") as ShippingMethod,
      shippingCost,
      total,
      customer: { guest: true, name: addr.nome },
      address: {
        provincia: addr.provincia,
        cidade: addr.cidade,
        bairro: addr.bairro,
        referencia: addr.referencia,
      },
      payment: { method: (payment?.type ?? "transfer") as PaymentKind },
    });

    // limpar carrinho e ir para confirmação consistente com o router: /confirm/:id
    cart.clear?.();
    navigate(`/confirm/${order.id}`, { replace: true });
  }

  const inputClass =
    "rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition";
  const chip = (activeChip: boolean) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition ${
      activeChip ? "border-blue-600 bg-blue-50 text-slate-800" : "border-slate-200 text-slate-700 hover:border-slate-300"
    }`;

  return (
    <>
      <Navbar
        sections={sections}
        active={active}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        smoothScrollTo={smoothScrollTo}
      />

      <div className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-3 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/cart" className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2">
              ← Voltar ao carrinho
            </Link>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="min-h-[70vh] bg-slate-50 py-8 px-3 md:px-8 font-[Inter]">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-700">1. Dados do cliente</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex flex-col text-sm">
                  <span>Nome</span>
                  <input className={inputClass} value={addr.nome} onChange={e => updateAddr("nome", e.target.value)} />
                  {errors.nome && <span className="text-red-600 text-xs mt-1">{errors.nome}</span>}
                </label>
                <label className="flex flex-col text-sm">
                  <span>Telefone (MZ)</span>
                  <input
                    className={inputClass}
                    placeholder="82/83/84/85/86/87 + 7 dígitos"
                    value={addr.telefone}
                    onChange={e => updateAddr("telefone", e.target.value)}
                  />
                  {errors.telefone && <span className="text-red-600 text-xs mt-1">{errors.telefone}</span>}
                </label>
              </div>
              {errors.cart && <p className="text-red-600 text-sm mt-2">{errors.cart}</p>}
            </section>

            <section className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-700">2. Endereço de entrega</h2>
              <div className="grid md:grid-cols-2 gap-4" onBlur={onAddressBlur}>
                <label className="flex flex-col text-sm">
                  <span>Província</span>
                  <input className={inputClass} value={addr.provincia} onChange={e => updateAddr("provincia", e.target.value)} />
                  {errors.provincia && <span className="text-red-600 text-xs mt-1">{errors.provincia}</span>}
                </label>
                <label className="flex flex-col text-sm">
                  <span>Cidade</span>
                  <input className={inputClass} value={addr.cidade} onChange={e => updateAddr("cidade", e.target.value)} />
                  {errors.cidade && <span className="text-red-600 text-xs mt-1">{errors.cidade}</span>}
                </label>
                <label className="flex flex-col text-sm">
                  <span>Bairro</span>
                  <input className={inputClass} value={addr.bairro} onChange={e => updateAddr("bairro", e.target.value)} />
                  {errors.bairro && <span className="text-red-600 text-xs mt-1">{errors.bairro}</span>}
                </label>
                <label className="flex flex-col text-sm">
                  <span>Ponto de referência (opcional)</span>
                  <input className={inputClass} value={addr.referencia ?? ""} onChange={e => updateAddr("referencia", e.target.value)} />
                </label>
              </div>
            </section>

            <section className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-700">3. Método de envio</h2>
              <div className="flex flex-wrap gap-3">
                {shippingRules.map((s: any) => (
                  <label key={s.id} className={chip(shippingId === s.id)}>
                    <input
                      type="radio"
                      name="shipping"
                      className="hidden"
                      checked={shippingId === s.id}
                      onChange={() => onChangeShipping(s.id)}
                    />
                    <span className="text-sm font-medium">
                      {s.service === "pickup" && "Retirar no local"}
                      {s.service === "flat" && "Taxa fixa"}
                      {s.service === "standard" && "Padrão (3–5 dias úteis)"}
                      {s.service === "express" && "Expresso (1–2 dias úteis)"}
                      {s.service === "zone" && "Por zona"}
                    </span>
                  </label>
                ))}
              </div>
              {shipping?.service === "pickup" && <p className="text-sm text-slate-500 mt-2">Levantamento no balcão. Sem custo.</p>}
              {shipping?.service === "zone" && (
                <p className="text-sm text-slate-500 mt-2">
                  Custo estimado por zona: <strong>{zoneCost ?? "—"} MZN</strong>
                </p>
              )}
            </section>

            <section className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-700">4. Pagamento</h2>
              <div className="grid md:grid-cols-3 gap-3">
                {payments.map(p => (
                  <label key={p.id} className={chip(paymentId === p.id)}>
                    <input
                      type="radio"
                      name="payment"
                      className="hidden"
                      checked={paymentId === p.id}
                      onChange={() => setPaymentId(p.id)}
                    />
                    <span className="text-sm font-medium">
                      {p.type === "mpesa" && "M-Pesa"}
                      {p.type === "emola" && "eMola"}
                      {p.type === "bank" && "Conta bancária"}
                    </span>
                  </label>
                ))}
              </div>

              {(payment?.type === "mpesa" || payment?.type === "emola") && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-3 text-sm text-slate-700">
                  <div>Telefone para pagamento: <strong>{(payment as any).walletPhone ?? "—"}</strong></div>
                  {payment?.instructions && <div className="mt-1">{payment.instructions}</div>}
                </div>
              )}
              {payment?.type === "bank" && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-3 text-sm text-slate-700 space-y-1">
                  <div>Banco: <strong>{(payment as any).bankName ?? "—"}</strong></div>
                  <div>Titular: <strong>{(payment as any).accountHolder ?? "—"}</strong></div>
                  <div>Nº da conta: <strong>{(payment as any).accountNumber ?? "—"}</strong></div>
                  {(payment as any).iban && <div>NIB/IBAN: <strong>{(payment as any).iban}</strong></div>}
                  {payment?.instructions && <div className="pt-1">{payment.instructions}</div>}
                </div>
              )}
              {errors.payment && <p className="text-red-600 text-sm mt-2">{errors.payment}</p>}
            </section>
          </div>

          <aside className="h-fit bg-white shadow-sm rounded-xl p-6 border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-700">Resumo do pedido</h2>
            <ul className="divide-y divide-slate-100">
              {items.map(it => (
                <li key={it.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.image || "/img/placeholder-product.jpg"}
                      alt={it.name}
                      className="h-14 w-14 rounded-md object-cover border border-slate-200"
                      loading="lazy"
                    />
                    <div className="text-sm">
                      <div className="text-slate-800">{it.name}</div>
                      <div className="text-slate-500">Quantidade: {it.qty}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-800">{it.qty * it.price} MZN</div>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t pt-3 text-sm text-slate-700 space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span>{subtotal} MZN</span></div>
              <div className="flex justify-between"><span>Envio</span><span>{shippingCost} MZN</span></div>
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Total</span><span>{total} MZN</span>
              </div>
            </div>
            <button
              onClick={placeOrder}
              disabled={items.length === 0}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
            >
              Confirmar pedido
            </button>
          </aside>
        </div>
      </div>
    </>
  );
}
