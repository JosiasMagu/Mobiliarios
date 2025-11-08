// src/Utils/reporting.ts
import { listAllOrders, type Order } from "@repo/order.repository";
import { listProducts } from "@repo/product.repository";
import type { Product } from "@model/product.model";

export type Period = { from: Date; to: Date };
export type DateRange = Period;

export type SalesBucket = { label: string; total: number; count: number };

export type TopProduct = {
  productId: number;
  name: string;
  qty: number;
  revenue: number;
};

export type CustomerReport = {
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
};

export type StockRow = {
  id: number;
  name: string;
  inStock: boolean;
  stockQty?: number;
};

function within(o: Order, p: Period): boolean {
  const t = new Date(o.createdAt).getTime();
  return t >= p.from.getTime() && t <= p.to.getTime();
}

function weekKey(d: Date): string {
  const t = new Date(d);
  const day = t.getDay();
  t.setDate(t.getDate() - day);
  t.setHours(0, 0, 0, 0);
  return `W-${t.toISOString().slice(0, 10)}`;
}

/** Vendas por período, agregadas por dia/semana/mês. */
export async function salesByPeriod(
  period: Period,
  granularity: "day" | "week" | "month" = "day"
): Promise<SalesBucket[]> {
  const all = await listAllOrders();
  const orders = all.filter((o: Order) => within(o, period));

  const keyOf = (d: Date) =>
    granularity === "day"
      ? d.toISOString().slice(0, 10)
      : granularity === "week"
      ? weekKey(d)
      : d.toISOString().slice(0, 7);

  const map = new Map<string, { total: number; count: number }>();
  for (const o of orders) {
    const k = keyOf(new Date(o.createdAt));
    const cur = map.get(k) ?? { total: 0, count: 0 };
    cur.total += o.total;
    cur.count += 1;
    map.set(k, cur);
  }

  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([label, v]) => ({ label, ...v }));
}

/** Produtos mais vendidos no período. */
export async function topSellingProducts(period: Period, limit = 10): Promise<TopProduct[]> {
  const all = await listAllOrders();
  const orders = all.filter((o: Order) => within(o, period));
  const map = new Map<number, TopProduct>();

  for (const o of orders) {
    for (const it of o.items) {
      const cur =
        map.get(it.productId) ??
        ({ productId: it.productId, name: it.name, qty: 0, revenue: 0 } as TopProduct);
      cur.qty += it.qty;
      cur.revenue += it.qty * it.price;
      map.set(it.productId, cur);
    }
  }

  return [...map.values()]
    .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
    .slice(0, Math.max(1, limit));
}

/** Novos x recorrentes no período. */
export async function customerReport(period: Period): Promise<CustomerReport> {
  const orders = await listAllOrders();

  const firstByKey = new Map<string, number>();
  for (const o of orders) {
    const oc: any = o;
    const key = (oc.customer?.email ?? oc.customer?.id ?? "").toLowerCase();
    if (!key) continue;
    const t = new Date(o.createdAt).getTime();
    const prev = firstByKey.get(key);
    if (prev == null || t < prev) firstByKey.set(key, t);
  }

  const inPeriod = orders.filter((o) => within(o, period));
  let newCustomers = 0;
  let returningCustomers = 0;

  for (const o of inPeriod) {
    const oc: any = o;
    const key = (oc.customer?.email ?? oc.customer?.id ?? "").toLowerCase();
    if (!key) continue;
    const first = firstByKey.get(key);
    if (first == null) continue;
    const t = new Date(o.createdAt).getTime();
    if (first === t && first >= period.from.getTime() && first <= period.to.getTime()) {
      newCustomers++;
    } else {
      returningCustomers++;
    }
  }

  return { newCustomers, returningCustomers, totalCustomers: newCustomers + returningCustomers };
}

/** Relatório de estoque atual. */
export async function stockReport(): Promise<StockRow[]> {
  const products: Product[] = await listProducts();
  return products.map((p) => ({
    id: Number(p.id),
    name: p.name,
    inStock: Boolean(p.inStock),
    stockQty: (p as any).stockQty != null ? Number((p as any).stockQty) : undefined,
  }));
}

export function lastNDays(n: number): Period {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - (n - 1));
  from.setHours(0, 0, 0, 0);
  return { from, to };
}

export function thisMonth(): Period {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth(), 1);
  return { from, to };
}

export function lastNMonths(n: number): Period {
  const to = new Date();
  const from = new Date(to);
  from.setMonth(to.getMonth() - (n - 1));
  from.setDate(1);
  from.setHours(0, 0, 0, 0);
  return { from, to };
}
