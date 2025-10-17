// src/Repository/order.repository.ts
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  productId: number;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

export type ShippingMethod = "standard" | "express" | "pickup" | "flat" | "zone";

export type PaymentKind =
  | "mpesa" | "emola" | "bank"     // loja/admin
  | "card" | "boleto" | "transfer" | "pix"; // legado

export type OrderAddress = {
  // loja
  provincia?: string;
  cidade?: string;
  bairro?: string;
  referencia?: string;
  // legado
  street?: string;
  state?: string;
  zip?: string;
};

export type Order = {
  id: string;
  number: string; // ex: "#1001"
  items: OrderItem[];
  subtotal: number;
  shippingMethod: ShippingMethod;
  shippingCost: number;
  total: number;

  customer: { id?: string; email?: string; guest: boolean; name?: string };
  address: OrderAddress;

  payment: { method: PaymentKind; reference?: string };

  status: OrderStatus;
  history: { at: string; status: OrderStatus; note?: string }[];

  createdAt: string;
  updatedAt: string;
};

const LS_KEY = "mobiliario.orders:v1";
const mem: { orders: Order[] } = { orders: [] };

/* ----------------------------- persistência ------------------------------ */
function load(): Order[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function save(list: Order[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

/* ----------------------------- helpers/seed ------------------------------ */
function nextNumber(): string {
  const base = 1000 + mem.orders.length;
  return `#${base}`;
}
function nowISO() { return new Date().toISOString(); }

/** Semeia alguns pedidos apenas na primeira execução. */
function ensureSeed() {
  const loaded = load();
  if (loaded.length > 0) {
    mem.orders = loaded;
    return;
  }
  const t1 = new Date(); t1.setDate(t1.getDate() - 3);
  const t2 = new Date(); t2.setDate(t2.getDate() - 1);

  const seed: Order[] = [
    {
      id: String(+t1),
      number: "#1000",
      items: [{ productId: 1, name: "Poltrona Nórdica Premium", price: 1299.9, qty: 1 }],
      subtotal: 1299.9,
      shippingMethod: "standard",
      shippingCost: 0,
      total: 1299.9,
      customer: { guest: true, name: "Convidado" },
      address: { provincia: "Maputo", cidade: "Maputo", bairro: "Central" },
      payment: { method: "transfer" },
      status: "paid",
      history: [
        { at: t1.toISOString(), status: "pending" },
        { at: t1.toISOString(), status: "paid" },
      ],
      createdAt: t1.toISOString(),
      updatedAt: t1.toISOString(),
    },
    {
      id: String(+t2),
      number: "#1001",
      items: [{ productId: 2, name: "Mesa de Centro Minimalista", price: 799.9, qty: 1 }],
      subtotal: 799.9,
      shippingMethod: "express",
      shippingCost: 0,
      total: 799.9,
      customer: { guest: false, id: "u-01", email: "mario@dominio.tld", name: "Mario" },
      address: { provincia: "Maputo", cidade: "Matola", bairro: "A" },
      payment: { method: "card" },
      status: "pending",
      history: [{ at: t2.toISOString(), status: "pending" }],
      createdAt: t2.toISOString(),
      updatedAt: t2.toISOString(),
    },
  ];
  mem.orders.push(...seed);
  save(mem.orders);
}
ensureSeed();

/* ---------------------------------- API ----------------------------------- */

/** Cria um pedido e persiste. */
export function createOrder(
  o: Omit<Order, "id" | "createdAt" | "updatedAt" | "number" | "history" | "status">
  & { status?: OrderStatus }
): Order {
  const id = String(Date.now());
  const createdAt = nowISO();
  const status: OrderStatus = o.status ?? "pending";
  const order: Order = {
    ...o,
    id,
    number: nextNumber(),
    createdAt,
    updatedAt: createdAt,
    status,
    history: [{ at: createdAt, status }],
  };
  mem.orders.push(order);
  save(mem.orders);
  return order;
}

/** Busca um pedido por id. */
export function getOrder(id: string): Order | null {
  return mem.orders.find((o) => String(o.id) === String(id)) ?? null;
}

/** Lista todos os pedidos (mais recentes primeiro). */
export function listAllOrders(): Order[] {
  return [...mem.orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/**
 * Lista pedidos do usuário por email **ou** id.
 * - Se `key`: compara com customer.email ou customer.id (case-insensitive).
 * - Se vazio/undefined: retorna pedidos de convidados.
 */
export async function listMyOrders(key?: string): Promise<Order[]> {
  const q = (key ?? "").trim().toLowerCase();
  const filtered = q
    ? mem.orders.filter(
        (o) =>
          (o.customer.email ?? "").toLowerCase() === q ||
          (o.customer.id ?? "").toLowerCase() === q
      )
    : mem.orders.filter((o) => o.customer.guest);
  return [...filtered].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Atualiza status e histórico. */
export function updateOrderStatus(id: string, status: OrderStatus, note?: string): Order {
  const i = mem.orders.findIndex(o => String(o.id) === String(id));
  if (i < 0) throw new Error("Pedido não encontrado");
  const at = nowISO();
  const next: Order = {
    ...mem.orders[i],
    status,
    updatedAt: at,
    history: [...mem.orders[i].history, { at, status, note }],
  };
  mem.orders[i] = next;
  save(mem.orders);
  return next;
}

/** Adiciona nota no histórico sem alterar o status atual. */
export function addOrderNote(id: string, note: string): Order {
  const i = mem.orders.findIndex(o => String(o.id) === String(id));
  if (i < 0) throw new Error("Pedido não encontrado");
  const at = nowISO();
  const next: Order = {
    ...mem.orders[i],
    updatedAt: at,
    history: [...mem.orders[i].history, { at, status: mem.orders[i].status, note }],
  };
  mem.orders[i] = next;
  save(mem.orders);
  return next;
}

/** Utilitário para testes: limpa memória e storage. */
export function __clearOrders() {
  mem.orders.length = 0;
  save(mem.orders);
}
