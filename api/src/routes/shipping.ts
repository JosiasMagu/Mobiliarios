// src/routes/shipping.ts
import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";
import { db } from "../lib/db";

const r = Router();
r.get("/_ping", (_req, res) => res.json({ ok: true, v: "shipping-retificado-1" }));

const up = (s: unknown) => String(s ?? "").toUpperCase();

const ZNum = z.union([z.number(), z.string()]).transform(v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
});

// aceita lowercase antes de validar
const ServiceEnum = z.enum(["STANDARD", "EXPRESS", "PICKUP", "ZONE"]);
const ServiceAnyCase = z
  .string()
  .transform(s => up(s))
  .pipe(ServiceEnum);

const RuleCreate = z.object({
  name: z.string().min(1),
  service: ServiceAnyCase,
  baseCost: ZNum,
  zoneJson: z.any().optional().nullable(),

  // campos usados no admin
  costPerKg: ZNum.optional(),
  minDays: ZNum.optional(),
  maxDays: ZNum.optional(),
  active: z.boolean().optional().default(true),
});
const RuleUpdate = RuleCreate.partial();

r.get("/rules", async (_req: Request, res: Response) => {
  const rules = await db.shippingRule
    .findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] })
    .catch(() => []);
  res.json(rules);
});

r.post("/rules", async (req: Request, res: Response) => {
  const parsed = RuleCreate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });
  }

  const d = parsed.data;
  try {
    // usa any para não travar se o Client estiver desatualizado
    const data: any = {
      name: d.name,
      service: d.service, // já uppercased no schema
      baseCost: new Prisma.Decimal(d.baseCost),
      zoneJson:
        typeof d.zoneJson === "string"
          ? d.zoneJson
          : d.zoneJson
          ? JSON.stringify(d.zoneJson)
          : null,
      active: d.active ?? true,
    };
    if (d.costPerKg != null) data.costPerKg = new Prisma.Decimal(d.costPerKg);
    if (d.minDays != null) data.minDays = Math.trunc(Number(d.minDays));
    if (d.maxDays != null) data.maxDays = Math.trunc(Number(d.maxDays));

    const row = await db.shippingRule.create({ data });
    res.status(201).json(row);
  } catch (e: any) {
    console.error("POST /shipping/rules create failed:", e?.code, e?.message, e?.meta);
    return res.status(400).json({
      error: "create failed",
      code: e?.code ?? null,
      message: e?.message ?? null,
      meta: e?.meta ?? null,
    });
  }
});

r.post("/rules/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: "invalid id" });

  const parsed = RuleUpdate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });
  }

  const d = parsed.data;
  try {
    const data: any = {
      ...(d.name != null ? { name: d.name } : {}),
      ...(d.service != null ? { service: d.service } : {}),
      ...(d.baseCost != null ? { baseCost: new Prisma.Decimal(d.baseCost) } : {}),
      ...(d.zoneJson !== undefined
        ? {
            zoneJson:
              typeof d.zoneJson === "string"
                ? d.zoneJson
                : d.zoneJson
                ? JSON.stringify(d.zoneJson)
                : null,
          }
        : {}),
      ...(d.active !== undefined ? { active: !!d.active } : {}),
    };
    if (d.costPerKg !== undefined) {
      data.costPerKg = d.costPerKg != null ? new Prisma.Decimal(d.costPerKg) : null;
    }
    if (d.minDays !== undefined) {
      data.minDays = d.minDays != null ? Math.trunc(Number(d.minDays)) : null;
    }
    if (d.maxDays !== undefined) {
      data.maxDays = d.maxDays != null ? Math.trunc(Number(d.maxDays)) : null;
    }

    const row = await db.shippingRule.update({ where: { id }, data });
    res.json(row);
  } catch (e: any) {
    console.error("POST /shipping/rules/:id update failed:", e?.code, e?.message, e?.meta);
    return res.status(400).json({
      error: "update failed",
      code: e?.code ?? null,
      message: e?.message ?? null,
      meta: e?.meta ?? null,
    });
  }
});

r.post("/rules/:id/delete", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: "invalid id" });

  try {
    await db.shippingRule.delete({ where: { id } });
  } catch (e: any) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")) {
      console.warn("DELETE shipping rule warn:", e?.code, e?.message);
    }
  }
  res.json({ ok: true });
});

/* ---- Settings globais (arquivo JSON) ---- */
type ShippingSettings = { freeShippingMin?: number; enablePickup: boolean };

const SETTINGS_FILE =
  process.env.SHIPPING_SETTINGS_FILE ||
  path.join(process.cwd(), "data", "shipping.settings.json");

async function ensureDir(p: string) {
  try {
    await fs.mkdir(path.dirname(p), { recursive: true });
  } catch {}
}
async function readSettings(): Promise<ShippingSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    const j = JSON.parse(raw);
    return {
      freeShippingMin:
        j?.freeShippingMin != null ? Number(j.freeShippingMin) : undefined,
      enablePickup: Boolean(j?.enablePickup ?? true),
    };
  } catch {
    return { enablePickup: true };
  }
}
async function writeSettings(s: ShippingSettings): Promise<ShippingSettings> {
  await ensureDir(SETTINGS_FILE);
  await fs.writeFile(
    SETTINGS_FILE,
    JSON.stringify(
      {
        freeShippingMin: s.freeShippingMin ?? null,
        enablePickup: !!s.enablePickup,
      },
      null,
      2
    ),
    "utf-8"
  );
  return s;
}

r.get("/settings", async (_req: Request, res: Response) => {
  res.json(await readSettings());
});
r.post("/settings", async (req: Request, res: Response) => {
  const body = (req.body || {}) as Partial<ShippingSettings>;
  const saved = await writeSettings({
    freeShippingMin:
      body.freeShippingMin != null ? Number(body.freeShippingMin) : undefined,
    enablePickup: Boolean(body.enablePickup ?? true),
  });
  res.json(saved);
});

export default r;
