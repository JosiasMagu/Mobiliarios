// src/Repository/order.repository.ts
import { httpGet, httpPost } from "@/Utils/api";

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";
export type OrderItem = { productId: number; name: string; price: number; qty: number; image?: string };
export type ShippingMethod = "standard" | "express" | "pickup" | "flat" | "zone";
export type PaymentKind = "mpesa" | "emola" | "bank";

export type OrderAddress = {
  nome?: string; telefone?: string; provincia?: string; cidade?: string; bairro?: string; referencia?: string;
  street?: string; state?: string; zip?: string;
};

export type Order = {
  id: string; number: string; items: OrderItem[]; subtotal: number;
  shippingMethod: ShippingMethod; shippingCost: number; total: number;
  payment: { method: PaymentKind; reference?: string; txRef?: string };
  status: OrderStatus; address: OrderAddress; createdAt: string; updatedAt?: string;
};

function up(s: string | undefined) { return String(s ?? "").toUpperCase(); }
function down(s: string | undefined) { return String(s ?? "").toLowerCase(); }

function normalizeOrder(raw: any): Order {
  const statusMap: Record<string, OrderStatus> = {
    pending: "pending", paid: "paid", shipped: "shipped", delivered: "delivered", cancelled: "cancelled",
  };
  return {
    id: String(raw.id),
    number: String(raw.number ?? raw.id),
    items: Array.isArray(raw.items)
      ? raw.items.map((i: any) => ({
          productId: Number(i.productId ?? i.id),
          name: String(i.name),
          price: Number(i.price),
          qty: Number(i.qty ?? i.quantity ?? 1),
          image: i.image ?? i.images?.[0]?.url,
        }))
      : [],
    subtotal: Number(raw.subtotal ?? 0),
    shippingMethod: ((down(raw.shippingMethod) as ShippingMethod) || "standard"),
    shippingCost: Number(raw.shippingCost ?? 0),
    total: Number(raw.total ?? 0),
    payment: {
      method: ((down(raw.paymentMethod ?? raw.payment?.method) as PaymentKind) || "mpesa"),
      reference: raw.payment?.reference,
      txRef: raw.payment?.txRef,
    },
    status: statusMap[down(raw.status)] ?? "pending",
    address: raw.address ?? {},
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

export async function createOrder(payload: {
  items: OrderItem[]; address: OrderAddress; shippingMethod: ShippingMethod; paymentMethod: PaymentKind;
}, token?: string): Promise<Order> {
  const body = {
    items: payload.items,
    address: payload.address,
    shippingMethod: up(payload.shippingMethod),
    paymentMethod: up(payload.paymentMethod),
    customer: token ? { guest: false } : { guest: true, name: payload.address?.nome || "Cliente" },
  };
  const raw = await httpPost<any>("/api/orders", body, token);
  if (raw && raw.items) return normalizeOrder(raw);
  const full = await httpGet<any>(`/api/orders/${raw?.id ?? raw}`, token);
  return normalizeOrder(full);
}

export async function getOrder(id: string, token?: string): Promise<Order> {
  const raw = await httpGet<any>(`/api/orders/${id}`, token);
  return normalizeOrder(raw);
}

export async function listMyOrders(token: string): Promise<Order[]> {
  const raw = await httpGet<any[]>("/api/orders/me", token);
  return (raw ?? []).map(normalizeOrder);
}

// --- adicionados para o Admin ---
export async function listAllOrders(token?: string): Promise<Order[]> {
  const raw = await httpGet<any[]>("/api/orders", token);
  return (raw ?? []).map(normalizeOrder);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  note?: string,
  token?: string
): Promise<Order> {
  const raw = await httpPost<any>(`/api/orders/${id}/status`, { status, note }, token);
  return normalizeOrder(raw);
}

export async function addOrderNote(id: string, note: string, token?: string): Promise<Order> {
  const raw = await httpPost<any>(`/api/orders/${id}/notes`, { note }, token);
  return normalizeOrder(raw);
}
