import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const r = Router();
r.use(requireAuth, requireRole("ADMIN"));

r.get("/metrics", async (_req, res) => {
  const [products, orders] = await Promise.all([
    db.product.count(),
    db.order.count(),
  ]);
  res.json({ products, orders });
});

r.get("/products", async (_req, res) => {
  const items = await db.product.findMany({
    include: { images: true, category: true },
    orderBy: { id: "desc" },
  });
  res.json(items);
});

export default r;
