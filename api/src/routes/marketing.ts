import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import type {
  CampaignStatus,
  CampaignAudience,
  CampaignProvider,
  CouponType,
} from "@prisma/client";

const r = Router();
r.use(requireAuth, requireRole("ADMIN"));

function norm<T extends string>(v: unknown): T | undefined {
  if (v == null) return undefined;
  return String(v).trim().toUpperCase() as T;
}

/* ---------- COUPONS ---------- */
const COUPON_TYPES: Record<string, CouponType> = { PERCENT: "PERCENT", FIXED: "FIXED" };

r.get("/coupons", async (_req, res) => {
  const items = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  // Prisma Decimal serializa como string; convertemos para number para o frontend
  res.json(
    items.map((c) => ({
      ...c,
      value: Number(c.value),
      minOrder: c.minOrder == null ? null : Number(c.minOrder),
    }))
  );
});

r.post("/coupons", async (req, res) => {
  const raw = req.body ?? {};
  const code = String(raw.code ?? "").toUpperCase().trim();
  const typeKey = norm<CouponType>(raw.type);
  const type = typeKey && COUPON_TYPES[typeKey];

  const value = Number(raw.value);
  const minOrder = raw.minOrder != null ? Number(raw.minOrder) : null;
  const maxUses = raw.maxUses != null ? Number(raw.maxUses) : null;
  const active = raw.active == null ? true : Boolean(raw.active);
  const expiresAt = raw.expiresAt ? new Date(String(raw.expiresAt)) : null;

  if (!code || !type || !Number.isFinite(value))
    return res.status(400).json({ error: "missing_fields" });

  try {
    const row = await db.coupon.create({
      data: { code, type, value, minOrder, maxUses, active, expiresAt },
    });
    // resposta já normalizada
    res.status(201).json({
      ...row,
      value: Number(row.value),
      minOrder: row.minOrder == null ? null : Number(row.minOrder),
    });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    if (msg.includes("Unique")) return res.status(409).json({ error: "code_exists" });
    res.status(500).json({ error: "create_failed" });
  }
});

r.patch("/coupons/:id", async (req, res) => {
  const { id } = req.params;
  const p = req.body ?? {};

  const data: any = {};
  if (p.code != null) data.code = String(p.code).toUpperCase().trim();
  if (p.type != null) {
    const t = COUPON_TYPES[norm<CouponType>(p.type) || ""];
    if (!t) return res.status(400).json({ error: "invalid_type" });
    data.type = t;
  }
  if (p.value != null) data.value = Number(p.value);
  if (p.minOrder !== undefined) data.minOrder = p.minOrder == null ? null : Number(p.minOrder);
  if (p.maxUses !== undefined) data.maxUses = p.maxUses == null ? null : Number(p.maxUses);
  if (p.active !== undefined) data.active = Boolean(p.active);
  if (p.expiresAt !== undefined)
    data.expiresAt = p.expiresAt == null ? null : new Date(String(p.expiresAt));

  try {
    const row = await db.coupon.update({ where: { id }, data });
    res.json({
      ...row,
      value: Number(row.value),
      minOrder: row.minOrder == null ? null : Number(row.minOrder),
    });
  } catch {
    res.status(404).json({ error: "not_found" });
  }
});

r.delete("/coupons/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.coupon.delete({ where: { id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "not_found" });
  }
});

/* ---------- LOYALTY / TIERS ---------- */
r.get("/tiers", async (_req, res) => {
  const items = await db.loyaltyTier.findMany({ orderBy: { minSpend: "asc" } });
  res.json(items);
});

r.put("/tiers", async (req, res) => {
  const t = req.body ?? {};
  if (!t.name) return res.status(400).json({ error: "missing_name" });

  if (!t.id) {
    const row = await db.loyaltyTier.create({
      data: { name: t.name, minSpend: Number(t.minSpend ?? 0), perk: String(t.perk ?? "") },
    });
    return res.status(201).json(row);
  }

  try {
    const row = await db.loyaltyTier.update({
      where: { id: String(t.id) },
      data: { name: t.name, minSpend: Number(t.minSpend ?? 0), perk: String(t.perk ?? "") },
    });
    res.json(row);
  } catch {
    res.status(404).json({ error: "not_found" });
  }
});

r.delete("/tiers/:id", async (req, res) => {
  const { id } = req.params;
  await db.loyaltyTier.delete({ where: { id } }).catch(() => {});
  res.json({ ok: true });
});

/* ---------- CAMPAIGNS ---------- */
const PROVIDERS: Record<string, CampaignProvider> = {
  MAILCHIMP: "MAILCHIMP",
  SENDGRID: "SENDGRID",
  CUSTOM: "CUSTOM",
};
const AUDIENCES: Record<string, CampaignAudience> = {
  ALL: "ALL",
  CUSTOMERS: "CUSTOMERS",
  GUESTS: "GUESTS",
};
const STATUSES: Record<string, CampaignStatus> = {
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  SENT: "SENT",
};

r.get("/campaigns", async (_req, res) => {
  const items = await db.campaign.findMany({ orderBy: { createdAt: "desc" } });
  res.json(items);
});

r.post("/campaigns", async (req, res) => {
  const c = req.body ?? {};
  const name = String(c.name ?? "").trim();
  const subject = String(c.subject ?? "").trim();
  if (!name || !subject) return res.status(400).json({ error: "missing_fields" });

  const provider = c.provider != null ? PROVIDERS[norm<CampaignProvider>(c.provider) || ""] : null;
  if (c.provider != null && !provider) return res.status(400).json({ error: "invalid_provider" });

  const audience = AUDIENCES[norm<CampaignAudience>(c.audience) || "ALL"] || "ALL";
  const status = STATUSES[norm<CampaignStatus>(c.status) || "DRAFT"] || "DRAFT";
  const scheduledAt = c.scheduledAt ? new Date(String(c.scheduledAt)) : null;

  const row = await db.campaign.create({
    data: { name, subject, provider, audience, status, scheduledAt },
  });
  res.status(201).json(row);
});

r.patch("/campaigns/:id", async (req, res) => {
  const { id } = req.params;
  const p = req.body ?? {};
  const data: any = {};

  if (p.name != null) data.name = String(p.name);
  if (p.subject != null) data.subject = String(p.subject);

  if (p.provider !== undefined) {
    if (p.provider == null) data.provider = null;
    else {
      const pv = PROVIDERS[norm<CampaignProvider>(p.provider) || ""];
      if (!pv) return res.status(400).json({ error: "invalid_provider" });
      data.provider = pv;
    }
  }

  if (p.audience !== undefined) {
    const au = AUDIENCES[norm<CampaignAudience>(p.audience) || ""];
    if (!au) return res.status(400).json({ error: "invalid_audience" });
    data.audience = au;
  }

  if (p.status !== undefined) {
    const st = STATUSES[norm<CampaignStatus>(p.status) || ""];
    if (!st) return res.status(400).json({ error: "invalid_status" });
    data.status = st;
  }

  if (p.scheduledAt !== undefined) {
    data.scheduledAt = p.scheduledAt == null ? null : new Date(String(p.scheduledAt));
  }

  try {
    const row = await db.campaign.update({ where: { id }, data });
    res.json(row);
  } catch {
    res.status(404).json({ error: "not_found" });
  }
});

r.delete("/campaigns/:id", async (req, res) => {
  const { id } = req.params;
  await db.campaign.delete({ where: { id } }).catch(() => {});
  res.json({ ok: true });
});

/* ---------- FEATURED PRODUCTS ---------- */
r.get("/featured", async (_req, res) => {
  const rows = await db.featuredProduct.findMany({ orderBy: { position: "asc" } });
  res.json({
    ids: rows.map((x: { productId: number }) => x.productId),
    updatedAt: new Date().toISOString(),
  });
});

r.put("/featured", async (req, res) => {
  const raw = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const ids: number[] = raw.map((n: unknown) => Number(n)).filter((n: number) => Number.isFinite(n));

  await db.featuredProduct.deleteMany({});
  if (ids.length) {
    await db.featuredProduct.createMany({
      data: ids.map((productId: number, idx: number) => ({ productId, position: idx })),
      skipDuplicates: true,
    });
  }
  res.json({ ids, updatedAt: new Date().toISOString() });
});

export default r;
