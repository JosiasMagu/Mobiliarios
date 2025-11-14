// routes/admin.ts
import { Router } from "express";
import { db } from "../lib/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const r = Router();

// todas as rotas admin exigem autenticação + ADMIN
r.use(requireAuth, requireRole("ADMIN"));

/** ------------------------------------------------------------------
 *  MÉTRICAS DO DASHBOARD
 *  GET /api/admin/metrics
 *  - products: total de produtos
 *  - orders: total de pedidos
 *  - revenueMonth: soma dos pedidos do mês corrente
 *  - lowStock: produtos com stock <= 2
 *  - activeCoupons: cupons ativos e não expirados
 *  - scheduledCampaigns: campanhas com status SCHEDULED
 *  - sentCampaigns: campanhas com status SENT
 *  ------------------------------------------------------------------ */
r.get("/metrics", async (_req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    products,
    orders,
    revenueAgg,
    lowStock,
    activeCoupons,
    scheduledCampaigns,
    sentCampaigns,
  ] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: monthStart, lt: nextMonthStart } },
    }),
    db.product.count({ where: { stock: { lte: 2 } } }),
    db.coupon.count({
      where: {
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    }),
    db.campaign.count({ where: { status: "SCHEDULED" } }),
    db.campaign.count({ where: { status: "SENT" } }),
  ]);

  res.set("Cache-Control", "no-store");
  res.json({
    products,
    orders,
    revenueMonth: Number(revenueAgg._sum.total || 0),
    lowStock,
    activeCoupons,
    scheduledCampaigns,
    sentCampaigns,
  });
});

/** ---- Produtos (listar) ---- */
r.get("/products", async (_req, res) => {
  const items = await db.product.findMany({
    include: { images: true, category: true },
    orderBy: { id: "desc" },
  });
  res.json(items);
});

/** ---- Produtos (criar) ---- */
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

/** =====================================================================
 *  ADMIN ORDERS LIST
 *  GET /api/admin/orders
 *  Retorna TODOS os pedidos num formato que o front já sabe normalizar.
 *  ===================================================================== */
r.get("/orders", async (_req, res) => {
  const list = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true, // OrderItem[]
      user: { select: { id: true, name: true, email: true } }, // cliente
      // address: true, // descomente se existir relação no schema
    },
  });

  const norm = list.map((o: any) => {
    const items = Array.isArray(o.items)
      ? o.items.map((i: any) => ({
          productId: Number(i.productId ?? i.id),
          name: String(i.name ?? i.title ?? ""),
          price: Number(i.price ?? 0),
          qty: Number(i.qty ?? i.quantity ?? 1),
          image: i.image ?? i.images?.[0]?.url ?? null,
        }))
      : [];

    const address = o.address
      ? {
          nome: o.address.nome ?? o.address.name,
          telefone: o.address.telefone ?? o.address.phone,
          provincia: o.address.provincia ?? o.address.state,
          cidade: o.address.cidade ?? o.address.city,
          bairro: o.address.bairro,
          referencia: o.address.referencia ?? null,
          street: o.address.street,
          state: o.address.state,
          zip: o.address.zip,
        }
      : {};

    return {
      id: String(o.id),
      number: String(o.number ?? o.id),
      items,
      subtotal: Number(o.subtotal ?? 0),
      shippingMethod: String(o.shippingMethod ?? "STANDARD").toLowerCase(),
      shippingCost: Number(o.shippingCost ?? 0),
      total: Number(o.total ?? 0),
      payment: { method: String(o.paymentMethod ?? "MPESA").toLowerCase() },
      status: String(o.status ?? "pending").toLowerCase(),
      address,
      createdAt: o.createdAt?.toISOString?.() ?? String(o.createdAt),
      updatedAt: o.updatedAt ? (o.updatedAt?.toISOString?.() ?? String(o.updatedAt)) : undefined,
      customer: o.user
        ? { id: String(o.user.id), name: o.user.name, email: o.user.email, guest: false }
        : { guest: true },
    };
  });

  res.set("Cache-Control", "no-store");
  res.json(norm);
});

/** =====================================================================
 *  ADMIN CUSTOMERS LIST
 *  GET /api/admin/customers
 *  Lista todos os utilizadores (mesmo sem pedidos) + métricas básicas.
 *  ===================================================================== */
r.get("/customers", async (_req, res) => {
  const users = await db.user.findMany({
    orderBy: { id: "desc" },
    select: { id: true, name: true, email: true },
  });

  // agrega pedidos por userId
  const orders = await db.order.findMany({
    select: { userId: true, total: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const agg = new Map<number, { count: number; sum: number; last?: string }>();
  for (const o of orders as any[]) {
    const uid = Number(o.userId ?? 0);
    if (!uid) continue;
    const a = agg.get(uid) ?? { count: 0, sum: 0, last: undefined };
    a.count += 1;
    a.sum += Number(o.total ?? 0);
    const cAt = (o.createdAt?.toISOString?.() ?? String(o.createdAt)) as string;
    a.last = a.last && a.last > cAt ? a.last : cAt;
    agg.set(uid, a);
  }

  const rows = users.map((u: any) => {
    const a = agg.get(Number(u.id)) ?? { count: 0, sum: 0, last: undefined };
    return {
      profile: { id: String(u.id), name: u.name ?? u.email, email: u.email },
      ordersCount: a.count,
      totalSpent: a.sum,
      lastOrderAt: a.last,
    };
  });

  res.set("Cache-Control", "no-store");
  res.json(rows);
});

export default r;
