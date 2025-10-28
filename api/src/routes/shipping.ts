// src/routes/shipping.ts
import { Router, Request, Response } from "express";
import { db } from "../lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";

const r = Router();
const up = (s: unknown) => String(s ?? "").toUpperCase();

/* ===== Zod ===== */
const RuleCreate = z.object({
  name: z.string().min(1),
  service: z.enum(["STANDARD", "EXPRESS", "PICKUP", "ZONE"]).transform(up),
  baseCost: z.union([z.number(), z.string()]).transform((v) => Number(v) || 0),
  zoneJson: z.any().optional().nullable(), // string JSON ou objeto
});
const RuleUpdate = RuleCreate.partial();

/* ===== CRUD Regras (Prisma: shippingRule) ===== */

r.get("/rules", async (_req: Request, res: Response) => {
  const rules = await db.shippingRule.findMany().catch(() => []);
  res.json(rules);
});

r.post("/rules", async (req: Request, res: Response) => {
  const parsed = RuleCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });

  const d = parsed.data;
  try {
    const row = await db.shippingRule.create({
      data: {
        name: d.name,
        service: up(d.service) as any,
        baseCost: new Prisma.Decimal(d.baseCost),
        zoneJson: typeof d.zoneJson === "string" ? d.zoneJson : d.zoneJson ? JSON.stringify(d.zoneJson) : null,
      },
    });
    res.json(row);
  } catch (e: any) {
    console.error("POST /shipping/rules create failed:", e?.code, e?.message, e?.meta);
    res.status(400).json({ error: "create failed" });
  }
});

r.post("/rules/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });

  const parsed = RuleUpdate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });

  const d = parsed.data;
  try {
    const row = await db.shippingRule.update({
      where: { id },
      data: {
        ...(d.name != null ? { name: d.name } : {}),
        ...(d.service != null ? { service: up(d.service) as any } : {}),
        ...(d.baseCost != null ? { baseCost: new Prisma.Decimal(d.baseCost) } : {}),
        ...(d.zoneJson !== undefined
          ? { zoneJson: typeof d.zoneJson === "string" ? d.zoneJson : d.zoneJson ? JSON.stringify(d.zoneJson) : null }
          : {}),
      },
    });
    res.json(row);
  } catch (e: any) {
    console.error("POST /shipping/rules/:id update failed:", e?.code, e?.message, e?.meta);
    res.status(400).json({ error: "update failed" });
  }
});

r.post("/rules/:id/delete", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });
  try {
    await db.shippingRule.delete({ where: { id } });
  } catch (e: any) {
    console.warn("DELETE shipping rule warn:", e?.code, e?.message);
  }
  res.json({ ok: true });
});

/* ===== Settings globais (arquivo JSON) ===== */

type ShippingSettings = { freeShippingMin?: number; enablePickup: boolean };

const SETTINGS_FILE =
  process.env.SHIPPING_SETTINGS_FILE ||
  path.join(process.cwd(), "data", "shipping.settings.json");

async function ensureDir(p: string) {
  try { await fs.mkdir(path.dirname(p), { recursive: true }); } catch {}
}
async function readSettings(): Promise<ShippingSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    const j = JSON.parse(raw);
    return {
      freeShippingMin: j?.freeShippingMin != null ? Number(j.freeShippingMin) : undefined,
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
    JSON.stringify({ freeShippingMin: s.freeShippingMin ?? null, enablePickup: !!s.enablePickup }, null, 2),
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
    freeShippingMin: body.freeShippingMin != null ? Number(body.freeShippingMin) : undefined,
    enablePickup: Boolean(body.enablePickup ?? true),
  });
  res.json(saved);
});

export default r;
