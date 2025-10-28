// routes/admin.ts
import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const r = Router();

// todas as rotas admin exigem autenticação + ADMIN
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

// criar produto (ADMIN)
r.post("/products", async (req, res) => {
  const {
    name,
    slug,
    price,
    stock = 0,
    active = true,
    images = [],
    categoryId = undefined,
  } = req.body || {};

  if (!name || !slug || price == null) {
    return res.status(400).json({ error: "missing_fields" });
  }

  // slug único (se houver unique no schema)
  try {
    const exists = await db.product.findUnique({ where: { slug: String(slug) } });
    if (exists) return res.status(409).json({ error: "slug_exists" });
  } catch {}

  const imgs =
    Array.isArray(images)
      ? images
          .filter(Boolean)
          .map((u: any) => (typeof u === "string" ? { url: u } : { url: String(u?.url || "") }))
          .filter((o: any) => o.url)
      : [];

  // monta data conforme ProductCreateInput
  const data: any = {
    name: String(name),
    slug: String(slug),
    price: Number(price),
    stock: Number(stock),
    active: Boolean(active),
    images: imgs.length ? { create: imgs } : undefined,
  };
  if (categoryId != null) {
    data.category = { connect: { id: Number(categoryId) } };
  }

  const created = await db.product.create({
    data,
    include: { images: true, category: true },
  });

  return res.status(201).json(created);
});

export default r;
