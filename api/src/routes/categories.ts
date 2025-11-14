import { Router } from "express";
import { db } from "../lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const r = Router();

/* =================== PÚBLICAS =================== */
r.get("/", async (_req, res) => {
  const items = await db.category.findMany({
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  res.json(items);
});

/**
 * GET /api/categories/:slug/products
 * Query:
 *  q,min,max,inStock,color,sort(bestsellers|newest|priceAsc|priceDesc),page,pageSize
 */
const Sort = z.enum(["bestsellers", "newest", "priceAsc", "priceDesc"]);
const QuerySchema = z.object({
  q: z.string().trim().optional(),
  min: z.coerce.number().nonnegative().optional(),
  max: z.coerce.number().nonnegative().optional(),
  inStock: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v == null ? undefined : v === "true")),
  color: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(60).default(12),
  sort: Sort.default("bestsellers"),
});

function sortToOrderBy(
  s: z.infer<typeof Sort>
): Prisma.ProductOrderByWithRelationInput[] {
  switch (s) {
    case "priceAsc":
      return [{ price: "asc" }];
    case "priceDesc":
      return [{ price: "desc" }];
    case "newest":
      // Product não tem createdAt no schema; usar id desc como proxy de “mais novo”
      return [{ id: "desc" }];
    case "bestsellers":
    default:
      // Sem coluna de vendas; fallback estável
      return [{ id: "desc" }];
  }
}

r.get("/:slug/products", async (req, res) => {
  const parsed = QuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "bad_query", issues: parsed.error.issues });
  }
  const { q, min, max, inStock, /* color */ page, pageSize, sort } = parsed.data;

  const where: Prisma.ProductWhereInput = {
    category: { slug: String(req.params.slug) },
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(min != null || max != null
      ? {
          price: {
            ...(min != null ? { gte: min } : {}),
            ...(max != null ? { lte: max } : {}),
          },
        }
      : {}),
    ...(inStock != null ? { stock: inStock ? { gt: 0 } : { gte: 0 } } : {}),
    // Se existir campo de cores no schema, habilite aqui:
    // ...(color ? { colors: { has: color } } : {}),
  };

  const [total, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: sortToOrderBy(sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        images: { select: { url: true } }, // retorna urls
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const items = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    stock: p.stock,
    images: (p.images ?? []).map((im) => im.url).filter(Boolean),
    imagesRel: [] as string[], // se usar mapeamento local, preencha aqui
    inStock: Number(p.stock ?? 0) > 0,
    rating: 0,
    reviews: 0,
  }));

  res.json({ items, page, pageSize, total, totalPages });
});

/* =================== ADMIN =================== */
r.post("/admin", async (req, res) => {
  const { name, slug, position } = req.body ?? {};
  const item = await db.category.create({
    data: { name, slug, position: typeof position === "number" ? position : 0 },
  });
  res.json(item);
});

r.patch("/admin/:id(\\d+)", async (req, res) => {
  const id = Number(req.params.id);
  const { name, slug, position } = req.body ?? {};
  const item = await db.category.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(position !== undefined ? { position: Number(position) } : {}),
    },
  });
  res.json(item);
});

r.delete("/admin/:id(\\d+)", async (_req, res) => {
  const id = Number(_req.params.id);
  await db.category.delete({ where: { id } });
  res.status(204).end();
});

r.put("/admin/reorder", async (req, res) => {
  const ids: number[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
  for (let i = 0; i < ids.length; i++) {
    await db.category.update({
      where: { id: ids[i] },
      data: { position: i },
    });
  }
  res.status(204).end();
});

export default r;
