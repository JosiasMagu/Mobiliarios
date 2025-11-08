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

    const orders = await listAllOrders();
    const byEmail = new Map<
      string,
      { name?: string; orders: Order[]; spent: number }
    >();

    for (const o of orders) {
      const oc: any = o;
      const key = (oc.customer?.email ?? oc.customer?.id ?? "").toLowerCase();
      if (!key) continue;

      // garante que 'orders' é Order[] e não 'never[]'
      const bucket =
        byEmail.get(key) ??
        { name: oc.customer?.name, orders: [] as Order[], spent: 0 };

      bucket.name ||= oc.customer?.name;
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
    const orders = await listAllOrders();
    const base = get().items.find((r) => r.profile.id === id);
    if (!base) return set({ current: null });

    const email = base.profile.email.toLowerCase();
    const ownOrders = orders.filter((o) => {
      const oc: any = o;
      return (
        (oc.customer?.email ?? "").toLowerCase() === email ||
        (oc.customer?.id ?? "").toLowerCase() === email ||
        (oc.customer?.id ?? "").toLowerCase() === base.profile.id
      );
    });

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
