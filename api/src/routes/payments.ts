import { Router, Request, Response } from "express";
import { db } from "../lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const r = Router();
const up = (s: unknown) => String(s ?? "").toUpperCase();

// validação
const PaymentCreate = z.object({
  name: z.string().min(1),
  type: z.enum(["EMOLA", "MPESA", "BANK"]),
  active: z.boolean().default(true),
  walletPhone: z.string().min(5).optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountHolder: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
});
const PaymentUpdate = PaymentCreate.partial();

// listar
r.get("/methods", async (_req: Request, res: Response) => {
  const items = await db.paymentMethod.findMany({ where: { active: true } }).catch(() => []);
  res.json(items);
});

// criar (com upsert por 'type' se houver unicidade)
r.post("/methods", async (req: Request, res: Response) => {
  const parsed = PaymentCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });

  const d = parsed.data;
  const data = {
    name: d.name,
    type: up(d.type) as any,
    active: d.active ?? true,
    walletPhone: d.walletPhone ?? null,
    bankName: d.bankName ?? null,
    accountHolder: d.accountHolder ?? null,
    accountNumber: d.accountNumber ?? null,
  };

  try {
    const row = await db.paymentMethod.create({ data });
    return res.json(row);
  } catch (e: any) {
    // conflito comum: já existe método com mesmo 'type' ou 'name'
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      try {
        const existing = await db.paymentMethod.findFirst({
          where: { OR: [{ type: data.type }, { name: data.name }] },
        });
        if (!existing) throw e;
        const row = await db.paymentMethod.update({ where: { id: existing.id }, data });
        return res.json(row);
      } catch (e2: any) {
        console.error("payments:create upsert failed:", e2?.code, e2?.message);
        return res.status(409).json({ error: "duplicate", detail: "Método já existe. Foi impossível atualizar automaticamente." });
      }
    }
    console.error("payments:create failed:", e?.code, e?.message, e?.meta);
    return res.status(400).json({ error: "create failed" });
  }
});

// atualizar por id
r.post("/methods/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });

  const parsed = PaymentUpdate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });

  const d = parsed.data;
  const data: any = {
    ...(d.name != null ? { name: d.name } : {}),
    ...(d.type != null ? { type: up(d.type) as any } : {}),
    ...(d.active != null ? { active: !!d.active } : {}),
    ...(d.walletPhone !== undefined ? { walletPhone: d.walletPhone ?? null } : {}),
    ...(d.bankName !== undefined ? { bankName: d.bankName ?? null } : {}),
    ...(d.accountHolder !== undefined ? { accountHolder: d.accountHolder ?? null } : {}),
    ...(d.accountNumber !== undefined ? { accountNumber: d.accountNumber ?? null } : {}),
  };

  try {
    const row = await db.paymentMethod.update({ where: { id }, data });
    res.json(row);
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({ error: "duplicate", detail: "Conflito de unicidade em 'type' ou 'name'." });
    }
    console.error("payments:update failed:", e?.code, e?.message, e?.meta);
    res.status(400).json({ error: "update failed" });
  }
});

// excluir
r.post("/methods/:id/delete", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });
  try {
    await db.paymentMethod.delete({ where: { id } });
  } catch (e: any) {
    // idempotente
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")) {
      console.warn("payments:delete warn:", e?.code, e?.message);
    }
  }
  res.json({ ok: true });
});

export default r;
