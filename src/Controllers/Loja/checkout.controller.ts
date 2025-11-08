// src/Controllers/Loja/checkout.controller.ts
import { useMemo, useState } from "react";
import { useCartStore } from "@state/cart.store";
import { listShippingMethods } from "@service/shipping.service";
import { processPayment } from "@service/payment.service";
import { createOrder } from "@repo/order.repository";
import type { PaymentKind } from "@repo/order.repository";
import type { PaymentPayload } from "@service/payment.service";
import { AuthService } from "@/Services/auth.service";

type PayMethod = PaymentPayload["method"]; // "card" | "boleto" | "transfer" | "pix"

/** Mapa para o tipo aceito pelo backend. Ajuste conforme sua API. */
function mapPayToRepo(kind: PayMethod): PaymentKind {
  // exemplo simples: tudo vira "bank"
  return "bank";
}

export function useCheckoutController() {
  const cart = useCartStore();

  // identificação
  const [email, setEmail] = useState("");
  const [guest, setGuest] = useState(true);

  // endereço
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  // envio
  const methods = listShippingMethods(zip);
  const [ship, setShip] = useState<"standard" | "express">("standard");

  // pagamento
  const [pay, setPay] = useState<PayMethod>("card");

  const shippingCost = useMemo(
    () => methods.find((m) => m.code === ship)?.cost ?? 0,
    [methods, ship]
  );

  const subtotal = cart.subtotal;
  const total = subtotal + shippingCost;

  const valid =
    cart.items.length > 0 &&
    street.trim() &&
    city.trim() &&
    state.trim() &&
    zip.trim() &&
    (guest || /\S+@\S+\.\S+/.test(email));

  async function submit(): Promise<{ ok: boolean; orderId?: string; error?: string }> {
    if (!valid) return { ok: false, error: "Preencha os campos obrigatórios." };

    // 1) pagamento
    const payRes = await processPayment({ method: pay, amount: total });
    if (!payRes.ok) return { ok: false, error: "Pagamento recusado." };

    // 2) pedido
    const token = AuthService.token() ?? undefined;
    const order = await createOrder(
      {
        items: cart.items,
        address: { street, state, zip }, // city pode ser agregado conforme seu backend
        shippingMethod: ship,
        paymentMethod: mapPayToRepo(pay),
      },
      token
    );

    cart.clear();
    return { ok: true, orderId: order.id };
  }

  return {
    email, setEmail, guest, setGuest,
    street, setStreet, city, setCity, state, setState, zip, setZip,
    ship, setShip, pay, setPay,
    methods, shippingCost, subtotal, total,
    canSubmit: Boolean(valid),
    submit,
    items: cart.items,
  };
}
