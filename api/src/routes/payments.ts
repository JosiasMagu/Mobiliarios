// src/routes/payments.ts
import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "../lib/db";
import e2 from "./payments.e2";

const r = Router();
const up = (s: unknown) => String(s ?? "").toUpperCase();
const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");
const MZ_PHONE = /^(?:82|83|84|85|86|87)\d{7}$/;

const ZNum = z.union([z.number(), z.string()]).transform(v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
});

// aceita lowercase e normaliza ANTES de validar
const PaymentTypeEnum = z.enum(["EMOLA", "MPESA", "BANK"]);
const PaymentTypeAnyCase = z
  .string()
  .transform(s => up(s))
  .pipe(PaymentTypeEnum);

const PaymentCreate = z.object({
  name: z.string().min(1),
  type: PaymentTypeAnyCase,
  active: z.boolean().optional().default(true),

  // carteira
  walletPhone: z
    .string()
    .optional()
    .nullable()
    .transform(v => (v == null || v === "" ? null : digits(v)))
    .refine(v => v == null || MZ_PHONE.test(v), { message: "walletPhone inválido" }),

  // banco
  bankName: z.string().optional().nullable(),
  accountHolder: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  iban: z.string().optional().nullable(),

  // extras mostrados no admin
  feePct: ZNum.optional(),
  fixedFee: ZNum.optional(),
  instructions: z.string().optional().nullable(),
});
const PaymentUpdate = PaymentCreate.partial();

/** Lista métodos de pagamento ativos para o checkout */
r.get("/methods", async (_req: Request, res: Response) => {
  const items = await db.paymentMethod
    .findMany({ where: { active: true }, orderBy: { name: "asc" } })
    .catch(() => []);
  res.json(items);
});

/** Cria (ou upsert) método de pagamento */
r.post("/methods", async (req: Request, res: Response) => {
  const parsed = PaymentCreate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });
  }

  const d = parsed.data;
  const data = {
    name: d.name,
    type: d.type, // já uppercased no schema
    active: d.active ?? true,

    walletPhone: d.walletPhone ?? null,

    bankName: d.bankName ?? null,
    accountHolder: d.accountHolder ?? null,
    accountNumber: d.accountNumber ?? null,
    iban: d.iban ?? null,

    feePct: d.feePct != null ? new Prisma.Decimal(d.feePct) : null,
    fixedFee: d.fixedFee != null ? new Prisma.Decimal(d.fixedFee) : null,
    instructions: d.instructions ?? null,
  };

  try {
    const row = await db.paymentMethod.create({ data });
    return res.status(201).json(row);
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      // conflito em unique(name) -> atualiza via upsert manual
      try {
        const existing = await db.paymentMethod.findFirst({
          where: { OR: [{ name: data.name }] },
        });
        if (!existing) throw e;
        const row = await db.paymentMethod.update({ where: { id: existing.id }, data });
        return res.json(row);
      } catch (e2: any) {
        console.error("payments:create upsert failed:", e2?.code, e2?.meta || e2?.message);
        return res.status(409).json({
          error: "duplicate",
          detail: "Método já existe e não pôde ser atualizado automaticamente.",
        });
      }
    }
    console.error("payments:create failed:", e?.code, e?.meta || e?.message);
    return res.status(400).json({ error: "create failed" });
  }
});

/** Atualiza método de pagamento */
r.post("/methods/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: "invalid id" });

  const parsed = PaymentUpdate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });
  }
  const d = parsed.data;

  const data: Record<string, any> = {
    ...(d.name != null ? { name: d.name } : {}),
    ...(d.type != null ? { type: d.type } : {}),
    ...(d.active != null ? { active: !!d.active } : {}),

    ...(d.walletPhone !== undefined ? { walletPhone: d.walletPhone ?? null } : {}),

    ...(d.bankName !== undefined ? { bankName: d.bankName ?? null } : {}),
    ...(d.accountHolder !== undefined ? { accountHolder: d.accountHolder ?? null } : {}),
    ...(d.accountNumber !== undefined ? { accountNumber: d.accountNumber ?? null } : {}),
    ...(d.iban !== undefined ? { iban: d.iban ?? null } : {}),

    ...(d.feePct !== undefined ? { feePct: d.feePct != null ? new Prisma.Decimal(d.feePct) : null } : {}),
    ...(d.fixedFee !== undefined
      ? { fixedFee: d.fixedFee != null ? new Prisma.Decimal(d.fixedFee) : null }
      : {}),
    ...(d.instructions !== undefined ? { instructions: d.instructions ?? null } : {}),
  };

  try {
    const row = await db.paymentMethod.update({ where: { id }, data });
    res.json(row);
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({ error: "duplicate", detail: "Conflito de unicidade em 'name'." });
    }
    console.error("payments:update failed:", e?.code, e?.meta || e?.message);
    res.status(400).json({ error: "update failed" });
  }
});

/** Remove método de pagamento */
r.post("/methods/:id/delete", async (_req: Request, res: Response) => {
  const id = Number(_req.params.id);
  if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: "invalid id" });

  try {
    await db.paymentMethod.delete({ where: { id } });
  } catch (e: any) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")) {
      console.warn("payments:delete warn:", e?.code, e?.meta || e?.message);
    }
  }
  res.json({ ok: true });
});

/* =========================
   Subrotas da e2Payments
   ========================= */
r.use("/e2", e2);

export default r;
