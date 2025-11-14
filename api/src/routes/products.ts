import { Router } from "express";
import { db } from "../lib/db";

const r = Router();

// GET /api/products?q=&cat=
r.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const cat = String(req.query.cat ?? "").trim().toLowerCase();

  const where: any = { active: true };
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (cat) where.category = { is: { slug: cat } };

  const items = await db.product.findMany({
    where,
    include: { images: { select: { url: true }, orderBy: { id: "asc" } }, category: true },
    take: 24,
    orderBy: { id: "desc" },
  });

  res.set("Cache-Control", "no-store");
  res.json(items);
});

// GET /api/products/:idOrSlug
r.get("/:idOrSlug", async (req, res) => {
  const idOrSlug = String(req.params.idOrSlug);
  const where = /^\d+$/.test(idOrSlug) ? { id: Number(idOrSlug) } : { slug: idOrSlug };

  const product = await db.product.findUnique({
    where,
    include: { images: { select: { url: true }, orderBy: { id: "asc" } }, category: true },
  });
  if (!product) return res.status(404).json({ error: "not_found" });

  const related = await db.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
    include: { images: { select: { url: true }, orderBy: { id: "asc" } } },
    take: 8,
    orderBy: { id: "desc" },
  });

  res.set("Cache-Control", "no-store");
  res.json({ product, related });
});

export default r;
