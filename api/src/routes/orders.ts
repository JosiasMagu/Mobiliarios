// api/src/routes/orders.ts
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, tryAuth } from "../middlewares/auth";

const Item = z.object({
  productId: z.number().int().positive(),
  qty: z.number().int().positive(),
});

const AddressZ = z.object({
  nome: z.string().min(1),
  telefone: z.string().min(5),
  provincia: z.string().min(1),
  cidade: z.string().min(1),
  bairro: z.string().min(1),
  referencia: z.string().optional(),
});

const CreateOrder = z.object({
  items: z.array(Item).min(1),
  shippingMethod: z.enum(["STANDARD", "EXPRESS", "PICKUP", "ZONE"]).default("STANDARD"),
  shippingCost: z.number().nonnegative().optional(),
  address: AddressZ,
  paymentMethod: z.enum(["EMOLA", "MPESA", "BANK"]).default("EMOLA"),
});

const r = Router();

const up = (s: string) => String(s).toUpperCase();

function toDTO(o: any) {
  return {
    id: String(o.id),
    number: String(o.id),
    items: (o.items ?? []).map((i: any) => ({
      productId: i.productId,
      name: i.name,
      price: Number(i.price),
      qty: i.qty,
      image: i.image ?? null,
    })),
    subtotal: Number(o.subtotal ?? 0),
    shippingMethod: String(o.shippingMethod ?? "STANDARD").toLowerCase(),
    shippingCost: Number(o.shippingCost ?? 0),
    total: Number(o.total ?? 0),
    payment: { method: String(o.paymentMethod ?? "MPESA").toLowerCase() },
    status: String(o.status ?? "PENDING").toLowerCase(),
    address: o.address
      ? {
          nome: o.address.nome,
          telefone: o.address.telefone,
          provincia: o.address.provincia,
          cidade: o.address.cidade,
          bairro: o.address.bairro,
          referencia: o.address.referencia ?? null,
        }
      : {},
    createdAt: o.createdAt?.toISOString?.() ?? String(o.createdAt),
    customer: o.user
      ? { id: String(o.user.id), name: o.user.name, email: o.user.email, guest: false }
      : { guest: true },
    history: [],
  };
}

/** Lista pedidos do usuário autenticado */
r.get("/me", requireAuth, async (req, res) => {
  const userId = Number((req as any).user!.id);
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { id: "desc" },
    include: {
      items: true,
      address: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
  res.set("Cache-Control", "no-store");
  res.json(orders.map(toDTO));
});

/** Cria pedido; associa ao user se autenticado (use requireAuth aqui se quiser bloquear convidados) */
r.post("/", tryAuth, async (req, res) => {
  const parsed = CreateOrder.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;

  // Carregar produtos
  const ids = [...new Set(data.items.map((i) => i.productId))];
  const prods = await prisma.product.findMany({
    where: { id: { in: ids }, active: true },
    select: {
      id: true,
      name: true,
      price: true,
      images: { select: { url: true }, take: 1, orderBy: { id: "asc" } },
    },
  });
  if (prods.length !== ids.length) return res.status(400).json({ error: "invalid_product" });
  const byId = new Map(prods.map((p) => [p.id, p]));

  const itemRows = data.items.map((i) => {
    const p = byId.get(i.productId)!;
    return {
      productId: p.id,
      name: p.name,
      price: p.price,
      qty: i.qty,
      image: p.images?.[0]?.url ?? null,
    };
  });

  const subtotal = itemRows.reduce((s, it) => s + Number(it.price) * it.qty, 0);
  const shipMethod = up(data.shippingMethod);
  const shippingCost =
    data.shippingCost ??
    (shipMethod === "PICKUP" ? 0 : shipMethod === "EXPRESS" ? 200 : shipMethod === "ZONE" ? 150 : 100);
  const total = subtotal + shippingCost;

  const userId = (req as any).user?.id ?? null;
  const guestName = userId ? null : "Cliente";

  const created = await prisma.order.create({
    data: {
      status: "PENDING",
      subtotal,
      shippingCost,
      total,
      paymentMethod: up(data.paymentMethod),
      shippingMethod: shipMethod,
      userId,
      guestName,
      items: { create: itemRows },
      address: { create: { ...data.address } },
    },
    include: {
      items: true,
      address: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  res.status(201).json(toDTO(created));
});

/** Busca pedido por id */
r.get("/:id(\\d+)", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "bad_id" });

  const o = await prisma.order.findUnique({
    where: { id },
    include: { items: true, address: true, user: { select: { id: true, name: true, email: true } } },
  });
  if (!o) return res.status(404).json({ error: "not_found" });

  const u = (req as any).user!;
  const can = o.userId === u.id || u.role === "ADMIN" || u.role === "GERENTE";
  if (!can) return res.status(403).json({ error: "forbidden" });

  res.set("Cache-Control", "no-store");
  res.json(toDTO(o));
});

export default r;
