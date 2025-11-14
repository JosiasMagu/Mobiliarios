import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "../lib/db";
import { requireAdmin } from "../middlewares/requireAdmin";

const a = Router();
a.use(requireAdmin);

const r = Router();

const ZNum = z.union([z.number(), z.string()]).transform(v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
});
const ZInt = z.union([z.number().int(), z.string()]).transform(v => {
  const n = Number(v);
  return Number.isInteger(n) ? n : 0;
});

// payload do dialog do admin: aceitamos muitos campos e mapeamos só os necessários ao DB
const ProductCreate = z.object({
  name: z.string().min(1),
  price: ZNum,
  categoryId: z.any().optional(),
  categoryName: z.string().optional(),
  categorySlug: z.string().optional(),
  stockQty: ZInt.optional(),
  status: z.enum(["published", "draft"]).optional(),
  images: z.array(z.string()).optional().default([]),
  image: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});
const ProductUpdate = ProductCreate.partial();

const ListQuery = z.object({
  search: z.string().optional(),
  page: ZInt.optional().default(1),
  pageSize: ZInt.optional().default(10),
  categoryId: z.string().optional(),
  status: z.enum(["published", "draft", "all"]).optional().default("all"),
  sort: z
    .enum(["name_asc", "name_desc", "price_asc", "price_desc", "created_desc"])
    .optional()
    .default("created_desc"),
});

// helpers
function slugify(x: string): string {
  return String(x || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
async function uniqueSlug(base: string): Promise<string> {
  const s = slugify(base) || "produto";
  let slug = s, i = 1;
  for (;;) {
    const found = await db.product.findUnique({ where: { slug } }).catch(() => null);
    if (!found) return slug;
    i++; slug = `${s}-${i}`;
  }
}
function mapDbProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    inStock: Number(p.stock) > 0,
    stockQty: Number(p.stock),
    status: p.active ? "published" : "draft",
    categoryId: String(p.categoryId),
    categoryName: p.category?.name,
    categorySlug: p.category?.slug,
    image: p.images?.[0]?.url,
    images: (p.images || []).map((i: any) => i.url),
    gallery: (p.images || []).map((i: any) => i.url),
    createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
    updatedAt: p.updatedAt?.toISOString?.() ?? p.updatedAt,
  };
}
async function ensureCategoryFromName(nameOrSlug?: string): Promise<number> {
  const s = (nameOrSlug || "").trim();
  if (!s) {
    const first = await db.category.findFirst({ orderBy: { id: "asc" } });
    if (first) return first.id;
    const created = await db.category.create({ data: { name: "Geral", slug: "geral" } });
    return created.id;
  }
  const slug = slugify(s);
  const existing = await db.category.findFirst({ where: { slug } });
  if (existing) return existing.id;
  const created = await db.category.create({ data: { name: s, slug } });
  return created.id;
}

// LIST
r.get("/", async (req: Request, res: Response) => {
  const q = ListQuery.safeParse(req.query);
  if (!q.success) return res.status(400).json({ error: "invalid query", issues: q.error.issues });

  const { page, pageSize, search, categoryId, status, sort } = q.data;
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: slugify(search), mode: "insensitive" } },
      { category: { is: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }
  if (categoryId) where.categoryId = Number(categoryId);
  if (status && status !== "all") where.active = status === "published";

  const orderBy =
    sort === "name_asc" ? { name: "asc" as const } :
    sort === "name_desc" ? { name: "desc" as const } :
    sort === "price_asc" ? { price: "asc" as const } :
    sort === "price_desc" ? { price: "desc" as const } :
    { id: "desc" as const }; // created_desc

  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: { images: { select: { url: true }, orderBy: { id: "asc" } }, category: true },
      orderBy,
      skip: Math.max(0, (page - 1) * pageSize),
      take: Math.max(1, pageSize),
    }),
  ]);

  res.json({ data: items.map(mapDbProduct), total, page, pageSize });
});

// CREATE
r.post("/", async (req: Request, res: Response) => {
  const parsed = ProductCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });
  const d = parsed.data;

  try {
    const catId =
      d.categoryId != null && String(d.categoryId).trim() !== "" ? Number(d.categoryId) : undefined;
    const slug = await uniqueSlug(d.name);
    const images = (d.images?.length ? d.images : d.gallery?.length ? d.gallery : d.image ? [d.image] : []).slice(0, 12);

    const created = await db.product.create({
      data: {
        name: d.name,
        slug,
        price: new Prisma.Decimal(d.price),
        stock: Number(d.stockQty ?? (d.status === "draft" ? 0 : 10)),
        active: d.status ? d.status === "published" : true,
        categoryId: catId ?? (await ensureCategoryFromName(d.categoryName || d.categorySlug)),
        images: images.length
          ? { createMany: { data: images.filter(u => !!String(u).trim()).map(u => ({ url: String(u).trim() })) } }
          : undefined,
      },
      include: { images: { select: { url: true }, orderBy: { id: "asc" } }, category: true },
    });

    res.status(201).json(mapDbProduct(created));
  } catch (e: any) {
    if (e?.code === "P2002") return res.status(409).json({ error: "duplicate", field: "slug" });
    console.error("POST /api/admin/products create failed:", e?.code, e?.message, e?.meta);
    res.status(400).json({ error: "create failed", code: e?.code ?? null, meta: e?.meta ?? null });
  }
});

// UPDATE parcial
r.patch("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });

  const parsed = ProductUpdate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid payload", issues: parsed.error.issues });
  const d = parsed.data;

  try {
    const patch: any = {};
    if (d.name != null) patch.name = d.name;
    if (d.price != null) patch.price = new Prisma.Decimal(d.price);
    if (d.stockQty != null) patch.stock = Number(d.stockQty);
    if (d.status != null) patch.active = d.status === "published";
    if (d.categoryId != null && String(d.categoryId).trim() !== "") patch.categoryId = Number(d.categoryId);

    const newImages =
      (d.images?.length ? d.images : d.gallery?.length ? d.gallery : d.image ? [d.image] : []) as string[];

    const row = await db.$transaction(async (trx) => {
      await trx.product.update({ where: { id }, data: patch });
      if (newImages.length) {
        await trx.productImage.deleteMany({ where: { productId: id } });
        await trx.productImage.createMany({
          data: newImages.filter(u => !!String(u).trim()).map(u => ({ productId: id, url: String(u).trim() })),
        });
      }
      return trx.product.findUnique({
        where: { id },
        include: { images: { select: { url: true }, orderBy: { id: "asc" } }, category: true },
      });
    });

    res.json(mapDbProduct(row));
  } catch (e: any) {
    console.error("PATCH /api/admin/products/:id failed:", e?.code, e?.message, e?.meta);
    res.status(400).json({ error: "update failed", code: e?.code ?? null, meta: e?.meta ?? null });
  }
});

// DELETE
/* ---------------- DELETE robusto (Postgres) ---------------- */
r.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid_id" });

  try {
    const found = await db.product.findUnique({ where: { id }, select: { id: true } });
    if (!found) return res.status(404).json({ error: "not_found" });

    await db.$transaction(async (trx) => {
      // 1) Apaga imagens conhecidas
      try { await trx.productImage.deleteMany({ where: { productId: id } }); } catch {}

      // 2) Descobre tabelas com coluna productId e remove dependentes (genérico)
      type Row = { table_schema: string; table_name: string };
      const rows = await trx.$queryRaw<Row[]>`SELECT table_schema, table_name
        FROM information_schema.columns
        WHERE column_name = 'productId' AND table_schema NOT IN ('pg_catalog','information_schema')`;

      // 3) Executa DELETE em cada tabela encontrada, exceto a própria "Product"
      for (const r of rows) {
        const fq = `"${r.table_schema}"."${r.table_name}"`;
        if (r.table_name === "Product") continue;
        // evita erro se a coluna for de outro tipo: usa cast explícito
        await trx.$executeRawUnsafe(`DELETE FROM ${fq} WHERE "productId" = $1`, id);
      }

      // 4) Tenta apagar o próprio produto (usa deleteMany para evitar P2025)
      const del = await trx.product.deleteMany({ where: { id } });
      if (del.count === 0) throw Object.assign(new Error("not_found"), { code: "NOT_FOUND" });
    });

    return res.status(204).end();
  } catch (e: any) {
    // Se for violação FK remanescente, devolve 409
    if (e?.code === "P2003") return res.status(409).json({ error: "product_in_use" });
    // Em dev, o middleware global já devolve file/line/stack
    console.error("DELETE /api/admin/products/:id failed:", e?.code, e?.message);
    return res.status(500).json({ error: "delete_failed" });
  }
});

/* ---------------- DEBUG: existe/counters ---------------- */
r.get("/:id/check", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid_id" });

  try {
    const row = await db.product.findUnique({
      where: { id },
      include: { images: { select: { id: true }, where: { productId: id } } },
    });
    const exists = !!row;
    const images = row?.images?.length ?? 0;
    return res.json({
      exists,
      images,
      db: (process.env.DATABASE_URL || "").slice(0, 32) + "…",
      id,
    });
  } catch (e: any) {
    return res.status(500).json({ error: "check_failed", message: e?.message || String(e) });
  }
});

// DUPLICATE
r.post("/:id/duplicate", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });

  try {
    const src = await db.product.findUnique({ where: { id }, include: { images: true } });
    if (!src) return res.status(404).json({ error: "not_found" });

    const slug = await uniqueSlug(`${src.name} copia`);
    const created = await db.product.create({
      data: {
        name: `${src.name} (cópia)`,
        slug,
        price: src.price,
        stock: src.stock,
        active: src.active,
        categoryId: src.categoryId,
        images: src.images.length ? { createMany: { data: src.images.map(i => ({ url: i.url })) } } : undefined,
      },
      include: { images: { select: { url: true }, orderBy: { id: "asc" } }, category: true },
    });
    res.status(201).json(mapDbProduct(created));
  } catch (e: any) {
    console.error("POST /api/admin/products/:id/duplicate failed:", e?.code, e?.message);
    res.status(400).json({ error: "duplicate failed" });
  }
});

export default r;
