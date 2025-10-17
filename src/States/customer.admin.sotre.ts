import { create } from "zustand";
import {
  getOrCreateProfile,
  listAddresses,
  getPrefs,
  type CustomerProfile,
  type Address,
  type Prefs,
} from "@repo/customer.repository";
import { listAllOrders, type Order } from "@repo/order.repository";

export type CustomerRow = {
  profile: CustomerProfile;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: string;
};

type Store = {
  items: CustomerRow[];
  loading: boolean;
  current: (CustomerRow & { addresses: Address[]; prefs: Prefs; orders: Order[] }) | null;

  fetch: () => Promise<void>;
  open: (id: string) => Promise<void>;
  close: () => void;
};

export const useAdminCustomers = create<Store>((set, get) => ({
  items: [],
  loading: false,
  current: null,

  fetch: async () => {
    set({ loading: true });

    // Deriva a base de clientes a partir dos pedidos em memória
    const orders = listAllOrders();
    const byEmail = new Map<
      string,
      { name?: string; orders: Order[]; spent: number }
    >();

    for (const o of orders) {
      const key = (o.customer.email ?? o.customer.id ?? "").toLowerCase();
      if (!key) continue;
      const bucket = byEmail.get(key) ?? { name: o.customer.name, orders: [], spent: 0 };
      bucket.name ||= o.customer.name;
      bucket.orders.push(o);
      bucket.spent += o.total;
      byEmail.set(key, bucket);
    }

    const rows: CustomerRow[] = [];
    for (const [email, b] of byEmail.entries()) {
      const profile = await getOrCreateProfile(email, b.name);
      const lastOrderAt = b.orders
        .slice()
        .sort((a, c) => (a.createdAt < c.createdAt ? 1 : -1))[0]?.createdAt;
      rows.push({
        profile,
        ordersCount: b.orders.length,
        totalSpent: b.spent,
        lastOrderAt,
      });
    }

    rows.sort((a, b) => b.totalSpent - a.totalSpent || b.ordersCount - a.ordersCount);
    set({ items: rows, loading: false });
  },

  open: async (id: string) => {
    const orders = listAllOrders();
    // encontra pela store; fallback procurando pelo id no map derivado
    const base = get().items.find((r) => r.profile.id === id);
    if (!base) return set({ current: null });

    const email = base.profile.email.toLowerCase();
    const ownOrders = orders.filter(
      (o) =>
        (o.customer.email ?? "").toLowerCase() === email ||
        (o.customer.id ?? "").toLowerCase() === email ||
        (o.customer.id ?? "").toLowerCase() === base.profile.id
    );

    const [addresses, prefs] = await Promise.all([
      listAddresses(base.profile.email),
      getPrefs(base.profile.email),
    ]);

    set({
      current: {
        ...base,
        addresses,
        prefs,
        orders: ownOrders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
      },
    });
  },

  close: () => set({ current: null }),
}));
