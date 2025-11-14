// api/src/routes/account.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middlewares/auth";

export const account = Router();
account.use(requireAuth);

/** ---------------- Perfil ---------------- */
account.get("/me", async (req, res) => {
  const userId = Number((req as any).user!.id);
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!u) return res.status(404).json({ error: "not_found" });
  res.json({
    id: String(u.id),
    name: u.name,
    email: u.email,
    createdAt: u.createdAt.toISOString(),
  });
});

/** ---------------- Endereços ---------------- */
account.get("/addresses", async (req, res) => {
  const userId = Number((req as any).user!.id);
  const list = await prisma.customerAddress.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });

  type Out = { id: number; street: string; city: string; state: string; zip: string | null };
  const out: Out[] = list.map((a): Out => ({
    id: a.id,
    street: a.street,
    city: a.city,
    state: a.state,
    zip: a.zip ?? null,
  }));

  res.json(out);
});

account.post("/addresses", async (req, res) => {
  const userId = Number((req as any).user!.id);
  const { street, city, state, zip } = req.body ?? {};
  if (!street || !city || !state) return res.status(400).json({ error: "invalid_address" });

  const saved = await prisma.customerAddress.create({
    data: { userId, street: String(street), city: String(city), state: String(state), zip: zip ? String(zip) : null },
  });

  res.json({
    id: saved.id,
    street: saved.street,
    city: saved.city,
    state: saved.state,
    zip: saved.zip ?? null,
  });
});

account.delete("/addresses/:id", async (req, res) => {
  const userId = Number((req as any).user!.id);
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "bad_id" });

  const a = await prisma.customerAddress.findFirst({ where: { id, userId } });
  if (!a) return res.status(404).json({ error: "not_found" });

  await prisma.customerAddress.delete({ where: { id } });
  res.status(204).end();
});

/** ---------------- Preferências ---------------- */
account.get("/prefs", async (req, res) => {
  const userId = Number((req as any).user!.id);
  const p = await prisma.customerPref.findUnique({ where: { userId } }).catch(() => null);
  res.json({ marketing: !!p?.marketing });
});

account.patch("/prefs", async (req, res) => {
  const userId = Number((req as any).user!.id);
  const { marketing } = req.body ?? {};

  const p = await prisma.customerPref.upsert({
    where: { userId },
    create: { userId, marketing: !!marketing },
    update: { marketing: !!marketing },
  });

  res.json({ marketing: !!p.marketing });
});

/** ---------------- Pedidos do cliente (atalho para a página de conta) ---------------- */
account.get("/orders", async (req, res) => {
  const userId = Number((req as any).user!.id);
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { id: "desc" },
    include: { items: true },
  });

  const rows = orders.map((o) => ({
    id: String(o.id),
    number: String(o.id),
    createdAt: o.createdAt.toISOString(),
    status: String(o.status ?? "PENDING").toLowerCase(),
    subtotal: Number(o.subtotal ?? 0),
    shippingCost: Number(o.shippingCost ?? 0),
    total: Number(o.total ?? 0),
    items: (o.items || []).map((i) => ({
      name: i.name,
      qty: i.qty,
      price: Number(i.price),
      image: i.image ?? null,
    })),
  }));

  res.set("Cache-Control", "no-store");
  res.json(rows);
});

export default account;
