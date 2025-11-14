// src/States/customer.admin.store.ts
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
import { httpGet } from "@utils/api";

export type CustomerRow = {
  profile: CustomerProfile;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: string;
};

type Current = CustomerRow & { addresses: Address[]; prefs: Prefs; orders: Order[] };

type Store = {
  items: CustomerRow[];
  loading: boolean;
  current: Current | null;

  fetch: () => Promise<void>;
  open: (id: string) => Promise<void>;
  close: () => void;
};

type Bucket = {
  name?: string;
  email?: string;
  id?: string;
  orders: Order[];
  spent: number;
};

export const useAdminCustomers = create<Store>((set, get) => ({
  items: [],
  loading: false,
  current: null,

  fetch: async () => {
    set({ loading: true });
    try {
      // 1) fonte direta: todos os utilizadores, mesmo sem pedidos
      try {
        const direct = await httpGet<any[]>("/api/admin/customers");
        if (Array.isArray(direct)) {
          const rows: CustomerRow[] = direct.map((r: any) => ({
            profile: {
              id: String(r?.profile?.id ?? r?.profile?.email ?? "").toLowerCase(),
              name: String(r?.profile?.name ?? r?.profile?.email ?? ""),
              email: String(r?.profile?.email ?? "").toLowerCase(),
            },
            ordersCount: Number(r?.ordersCount ?? 0),
            totalSpent: Number(r?.totalSpent ?? 0),
            lastOrderAt: r?.lastOrderAt ? String(r.lastOrderAt) : undefined,
          }));
          rows.sort((a, b) => b.totalSpent - a.totalSpent || b.ordersCount - a.ordersCount);
          set({ items: rows });
          return;
        }
      } catch {
        // ignora e usa fallback por pedidos
      }

      // 2) fallback: agrega por pedidos /api/admin/orders
      const orders = await listAllOrders();

      const buckets: Map<string, Bucket> = new Map();

      for (const o of orders) {
        const oc: any = o;
        const kEmail = String(oc.customer?.email ?? "").toLowerCase();
        const kId = String(oc.customer?.id ?? "").toLowerCase();
        const key = kEmail || kId;
        if (!key) continue;

        const existing = buckets.get(key);
        const bucket: Bucket =
          existing ??
          {
            name: oc.customer?.name,
            email: oc.customer?.email,
            id: oc.customer?.id,
            orders: [] as Order[],
            spent: 0,
          };

        bucket.name ||= oc.customer?.name;
        bucket.email ||= oc.customer?.email;
        bucket.id ||= oc.customer?.id;

        bucket.orders.push(o);
        bucket.spent += Number(o.total || 0);

        if (!existing) buckets.set(key, bucket);
      }

      const rows: CustomerRow[] = await Promise.all(
        Array.from(buckets.values()).map(async (b) => {
          const pid = String(b.email ?? b.id ?? "").toLowerCase();
          const profile = await getOrCreateProfile(pid, b.name);

          const lastOrderAt =
            b.orders.length > 0
              ? b.orders.reduce(
                  (acc, cur) => (acc > cur.createdAt ? acc : cur.createdAt),
                  b.orders[0].createdAt
                )
              : undefined;

          return {
            profile,
            ordersCount: b.orders.length,
            totalSpent: b.spent,
            lastOrderAt,
          };
        })
      );

      rows.sort((a, b) => b.totalSpent - a.totalSpent || b.ordersCount - a.ordersCount);
      set({ items: rows });
    } catch (e) {
      console.warn("Falha ao listar clientes admin:", e);
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },

  open: async (id: string) => {
    const base = get().items.find((r) => r.profile.id === id);
    if (!base) {
      set({ current: null });
      return;
    }

    const all = await listAllOrders();
    const email = String(base.profile.email || "").toLowerCase();
    const pid = String(base.profile.id || "").toLowerCase();

    const ownOrders = all
      .filter((o) => {
        const oc: any = o;
        const ocEmail = String(oc.customer?.email ?? "").toLowerCase();
        const ocId = String(oc.customer?.id ?? "").toLowerCase();
        return ocEmail === email || ocId === email || ocId === pid;
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    const [addresses, prefs] = await Promise.all([
      listAddresses(base.profile.email),
      getPrefs(base.profile.email),
    ]);

    set({
      current: {
        ...base,
        addresses,
        prefs,
        orders: ownOrders,
      },
    });
  },

  close: () => set({ current: null }),
}));
