import { Router } from "express";
import { db } from "../lib/db";
import { z } from "zod";
import { requireAuth, tryAuth } from "../middlewares/auth";

const Item = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().positive(),
  image: z.string().optional(),
});

const Address = z.object({
  nome: z.string().min(1),
  telefone: z.string().min(5),
  provincia: z.string().min(1),
  cidade: z.string().min(1),
  bairro: z.string().min(1),
  referencia: z.string().optional(),
});

const CreateOrder = z.object({
  items: z.array(Item).min(1),
  subtotal: z.number().nonnegative().optional(),
  shippingMethod: z.enum(["STANDARD", "EXPRESS", "PICKUP", "ZONE"]).default("STANDARD"),
  shippingCost: z.number().nonnegative().optional(),
  total: z.number().nonnegative().optional(),
  customer: z.object({
    guest: z.boolean().default(true),
    id: z.number().int().optional(),
    name: z.string().default("Cliente"),
    email: z.string().email().optional(),
  }).default({ guest: true, name: "Cliente" }),
  address: Address,
  paymentMethod: z.enum(["EMOLA", "MPESA", "BANK"]).default("EMOLA"),
});

function sum(items: { price: number; qty: number }[]) { return items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0); }
function up(s: string) { return String(s).toUpperCase(); }

const r = Router();

r.get("/me", requireAuth, async (req, res) => {
  const user = (req as any).user as { id: number };
  const items = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { id: "desc" },
    include: { items: true, address: true },
  });
  res.json(items);
});

r.post("/", tryAuth, async (req, res) => {
  const parsed = CreateOrder.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;

  const ids = data.items.map(i => i.productId);
  const prods = await db.product.findMany({ where: { id: { in: ids } } });
  if (prods.length !== ids.length) return res.status(400).json({ error: "produto inválido" });

  const calcSubtotal = data.subtotal ?? sum(data.items);
  const ship = data.shippingCost ?? 0;
  const total = data.total ?? (calcSubtotal + ship);

  const authUser = (req as any).user as { id: number } | undefined;
  const userId = authUser?.id ?? (data.customer.guest ? null : (data.customer.id ?? null));
  const guestName = userId ? null : data.customer.name;

  const order = await db.order.create({
    data: {
      status: "PENDING",
      subtotal: calcSubtotal,
      shippingCost: ship,
      total,
      paymentMethod: up(data.paymentMethod),
      shippingMethod: up(data.shippingMethod),
      userId,
      guestName,
      items: { create: data.items.map(i => ({ ...i })) },
      address: { create: { ...data.address } },
    },
    include: { items: true, address: true },
  });

  res.status(201).json(order);
});

r.get("/:id(\\d+)", async (req, res) => {
  const id = Number(req.params.id);
  const order = await db.order.findUnique({ where: { id }, include: { items: true, address: true } });
  if (!order) return res.status(404).json({ error: "not found" });
  res.json(order);
});

export default r;
