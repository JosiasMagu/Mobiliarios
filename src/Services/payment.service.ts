// src/Services/payment.service.ts (mock)
export type PaymentPayload = {
  method: "card" | "boleto" | "transfer" | "pix";
  amount: number;
};

export async function processPayment(_p: PaymentPayload) {
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true, tid: "T" + Math.floor(Math.random() * 1e8) };
}
