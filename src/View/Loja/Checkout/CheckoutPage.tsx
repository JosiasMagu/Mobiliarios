import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/Components/home/Navbar";
import { listPaymentMethods, MZ_PHONE_REGEX, type PaymentMethod } from "@/Repository/payment.repository";
import { listShippingRules, estimateZoneCost, type Carrier } from "@/Repository/shipping.repository";
import { useCartStore } from "@state/cart.store";
import { useAuthStore } from "@state/auth.store";
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
    productId: i.productId,
    name: i.name,
    qty: i.qty,
    price: i.price,
    image: i.image,
  }));

  // Usuário logado
  const auth = useAuthStore();

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

  // Pagamento e envio (carregamento assíncrono)
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [shippingRules, setShippingRules] = useState<Carrier[]>([]);
  const [paymentId, setPaymentId] = useState<string>("");
  const [shippingId, setShippingId] = useState<string>("");
  const [zoneCost, setZoneCost] = useState<number | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const [pms, ships] = await Promise.all([listPaymentMethods(), listShippingRules()]);
        setPayments(pms);
        setShippingRules(ships);
        if (pms.length) setPaymentId(String(pms[0].id));
        if (ships.length) setShippingId(String(ships[0].id));
      } catch (e) {
        // silencia; erros aparecerão ao validar/usar
      }
    })();
  }, []);

  const payment = useMemo(
    () => payments.find(p => String(p.id) === paymentId),
    [payments, paymentId]
  );

  const shipping = useMemo(
    () => shippingRules.find(s => String(s.id) === shippingId),
    [shippingRules, shippingId]
  );

  // Totais
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);

  const shippingCost = useMemo(() => {
    if (!shipping) return 0;
    if (shipping.service === "pickup") return 0;
    if (shipping.service === "zone") return zoneCost ?? 0;
    return Number(shipping.baseCost ?? 0);
  }, [shipping, zoneCost]);

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
    if ((shipping?.service ?? "standard") !== "pickup") {
      if (!addr.provincia) e.provincia = "Província obrigatória.";
      if (!addr.cidade) e.cidade = "Cidade obrigatória.";
      if (!addr.bairro) e.bairro = "Bairro obrigatório.";
    }
    if (!payment) e.payment = "Selecione um método de pagamento.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Cálculo de custo por zona quando troca envio ou endereço
  function recalcZoneCost(sel?: Carrier) {
    const rule = sel ?? shipping;
    if (rule?.service === "zone" && addr.provincia) {
      // peso estimado simples para o cálculo base
      setZoneCost(estimateZoneCost(rule, 5));
    } else {
      setZoneCost(undefined);
    }
  }

  function onChangeShipping(id: string) {
    setShippingId(id);
    const sel = shippingRules.find(r => String(r.id) === id);
    recalcZoneCost(sel);
  }
  function onAddressBlur() {
    recalcZoneCost();
  }

  async function placeOrder() {
    if (!validate()) return;

    const customer = auth.user
      ? { guest: false as const, id: auth.user.id, email: (auth.user as any).email ?? undefined, name: auth.user.name }
      : { guest: true as const, name: addr.nome };

    try {
      const order = await createOrder({
        items,
        address: {
          provincia: addr.provincia,
          cidade: addr.cidade,
          bairro: addr.bairro,
          referencia: addr.referencia,
        },
        shippingMethod: (shipping?.service ?? "standard") as ShippingMethod,
        paymentMethod: (payment?.type ?? "emola") as PaymentKind,
      });
      cart.clear?.();
      navigate(`/confirm/${order.id}`, { replace: true });
    } catch (e: any) {
      setErrors(prev => ({ ...prev, submit: e?.message || "Falha ao criar pedido" }));
    }
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
            {/* 1. Dados */}
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

            {/* 2. Endereço */}
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

            {/* 3. Envio */}
            <section className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-700">3. Método de envio</h2>
              <div className="flex flex-wrap gap-3">
                {shippingRules.map((s) => (
                  <label key={s.id} className={chip(String(shippingId) === String(s.id))}>
                    <input
                      type="radio"
                      name="shipping"
                      className="hidden"
                      checked={String(shippingId) === String(s.id)}
                      onChange={() => onChangeShipping(String(s.id))}
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

            {/* 4. Pagamento */}
            <section className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-700">4. Pagamento</h2>
              <div className="grid md:grid-cols-3 gap-3">
                {payments.map(p => (
                  <label key={p.id} className={chip(paymentId === String(p.id))}>
                    <input
                      type="radio"
                      name="payment"
                      className="hidden"
                      checked={paymentId === String(p.id)}
                      onChange={() => setPaymentId(String(p.id))}
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
              {errors.submit && <p className="text-red-600 text-sm mt-2">{errors.submit}</p>}
            </section>
          </div>

          {/* Resumo */}
          <aside className="h-fit bg-white shadow-sm rounded-xl p-6 border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-700">Resumo do pedido</h2>
            <ul className="divide-y divide-slate-100">
              {items.map(it => (
                <li key={`${it.productId}`} className="flex items-center justify-between py-3">
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
