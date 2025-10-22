import { Router } from "express";
import { db } from "../lib/db";

const r = Router();

r.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const cat = String(req.query.cat ?? "").trim();

  const where: any = { active: true };
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (cat) where.category = { slug: cat };

  const items = await db.product.findMany({
    where,
    include: { images: true, category: true },
    take: 24,
    orderBy: { id: "desc" },
  });
  res.json(items);
});

r.get("/:id(\\d+)", async (req, res) => {
  const id = Number(req.params.id);

  const product = await db.product.findUnique({
    where: { id },
    include: { images: true, category: true },
  });
  if (!product) return res.status(404).json({ error: "not found" });

  const related = await db.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: id } },
    include: { images: true },
    take: 8,
    orderBy: { id: "desc" },
  });

  res.json({ product, related });
});

export default r;
