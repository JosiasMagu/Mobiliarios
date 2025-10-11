// src/Repository/order.repository.ts
export type OrderItem = {
  productId: number;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shippingMethod: "standard" | "express";
  shippingCost: number;
  total: number;
  customer: { id?: string; email?: string; guest: boolean }; // <- aceita id OU email
  address: { street: string; city: string; state: string; zip: string };
  payment: { method: "card" | "boleto" | "transfer" | "pix" };
  createdAt: string;
};

const mem: { orders: Order[] } = { orders: [] };

/** Cria um pedido em memória. */
export function createOrder(o: Omit<Order, "id" | "createdAt">): Order {
  const id = String(Date.now());
  const order: Order = { ...o, id, createdAt: new Date().toISOString() };
  mem.orders.push(order);
  return order;
}

/** Busca um pedido por id. */
export function getOrder(id: string): Order | null {
  return mem.orders.find((o) => o.id === id) ?? null;
}

/** Lista todos os pedidos (mais recentes primeiro). */
export function listAllOrders(): Order[] {
  return [...mem.orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/**
 * Lista pedidos do usuário por email **ou** id (compat com controllers antigos).
 * - Se `key` informado: compara com customer.email ou customer.id (case-insensitive).
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

/** Utilitário para testes: limpa memória. */
export function __clearOrders() {
  mem.orders.length = 0;
}
