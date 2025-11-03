// api/src/routes/products.ts
import { Router } from "express";
import { db } from "../lib/db";

const r = Router();

// GET /api/products?q=&cat=
r.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const cat = String(req.query.cat ?? "").trim().toLowerCase();

  const where: any = { active: true };
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (cat) where.category = { slug: cat }; // slug salvo em lower-case

  const items = await db.product.findMany({
    where,
    include: { images: true, category: true },
    take: 24,
    orderBy: { id: "desc" },
  });

  res.json(items);
});

// GET /api/products/:idOrSlug  -> aceita 123 ou "armario-deslizante"
r.get("/:idOrSlug", async (req, res) => {
  const param = String(req.params.idOrSlug);
  const isId = /^\d+$/.test(param);

  const product = await db.product.findUnique({
    where: isId ? { id: Number(param) } : { slug: param.toLowerCase() },
    include: { images: true, category: true },
  });

  if (!product) return res.status(404).json({ error: "not found" });

  const related = await db.product.findMany({
    where: {
      active: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { images: true },
    take: 8,
    orderBy: { id: "desc" },
  });

  res.json({ product, related });
});

export default r;
