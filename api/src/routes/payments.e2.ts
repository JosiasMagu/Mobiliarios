// src/routes/payments.e2.ts
import { Router } from "express";
import { e2C2BPay, e2ListWallets, e2ListPaymentsAll, e2ListPaymentsPaginate } from "../lib/e2.client";

const r = Router();

/** Iniciar pagamento C2B (para o checkout) */
r.post("/c2b", async (req, res) => {
  try {
    const { amount, phone, reference } = req.body;
    const walletId = process.env.E2_WALLET_ID!;
    if (!walletId) throw new Error("E2_WALLET_ID ausente");
    if (!amount || !phone || !reference) throw new Error("amount, phone, reference são obrigatórios");

    const digits = String(phone).replace(/\D/g, "");
    if (!/^\d{9}$/.test(digits)) throw new Error("phone inválido. use 9 dígitos ex.: 84xxxxxxx");

    const data = await e2C2BPay({ walletId, amount: Number(amount), phone: digits, reference: String(reference) });
    res.json({ ok: true, data });
  } catch (e: any) {
    const msg = String(e?.message || "erro");
    const isTimeout = /timeout/i.test(msg);
    res.status(isTimeout ? 504 : 400).json({ ok: false, error: msg }); // 504 ajuda a identificar
  }
});

/** Webhook opcional (se o painel suportar callback) */
r.post("/webhook", async (req, res) => {
  // guarde req.body em logs e atualize seu pedido/pagamento
  // ex.: status: SUCCESS/FAILED, external_reference, etc.
  console.log("E2 WEBHOOK:", req.body);
  res.json({ ok: true });
});

/** Utilitários para debug (opcionais, proteger com auth interna) */
r.post("/wallets", async (_req, res) => {
  try { res.json(await e2ListWallets()); }
  catch (e:any) { res.status(400).json({ error: e.message }); }
});

r.post("/history/all", async (_req, res) => {
  try { res.json(await e2ListPaymentsAll()); }
  catch (e:any) { res.status(400).json({ error: e.message }); }
});

r.post("/history/paginate", async (req, res) => {
  try {
    const qty = Number(req.body.qty ?? 20);
    res.json(await e2ListPaymentsPaginate(qty));
  } catch (e:any) {
    res.status(400).json({ error: e.message });
  }
});

export default r;
