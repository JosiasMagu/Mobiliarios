import { Router } from "express";
import { db } from "../lib/db";
import type { CouponType } from "@prisma/client";

const r = Router();

function computeDiscount(sub: number, type: CouponType, value: number) {
  if (sub <= 0) return 0;
  if (type === "PERCENT") return Math.max(0, Math.min(sub, sub * (value / 100)));
  return Math.max(0, Math.min(sub, value));
}

r.get("/validate", async (req, res) => {
  const code = String(req.query.code ?? "").toUpperCase().trim();
  const subtotal = Number(req.query.subtotal ?? 0);
  if (!code) return res.status(400).json({ error: "missing_code" });

  const c = await db.coupon.findUnique({ where: { code } }).catch(() => null);
  const now = new Date();

  const valid =
    !!c &&
    c.active &&
    (!c.expiresAt || c.expiresAt > now) &&
    (!c.maxUses || c.used < c.maxUses) &&
    subtotal > 0 &&
    (!c.minOrder || subtotal >= Number(c.minOrder));

  if (!valid) return res.json({ valid: false });

  const discount = computeDiscount(subtotal, c.type, Number(c.value));
  res.json({
    valid: true,
    code: c.code,
    type: c.type,
    value: Number(c.value),
    discount,
    minOrder: c.minOrder ? Number(c.minOrder) : undefined,
    expiresAt: c.expiresAt ?? undefined,
  });
});

export default r;
