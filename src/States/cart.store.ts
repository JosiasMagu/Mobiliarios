// src/state/cart.store.ts  (substitua o arquivo)
import { create } from "zustand";

const STORAGE_KEY = "cart:v1";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

type CartState = {
  items: CartItem[];
  wishlistCount: number;

  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
  addWish: () => void;

  totalQty: number;
  subtotal: number;
};

function loadInitial(): Pick<CartState, "items" | "wishlistCount"> {
  if (typeof window === "undefined") return { items: [], wishlistCount: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], wishlistCount: 0 };
    const parsed = JSON.parse(raw);
    const items: CartItem[] = Array.isArray(parsed.items) ? parsed.items : [];
    const wishlistCount = Number(parsed.wishlistCount) || 0;
    return { items, wishlistCount };
  } catch {
    return { items: [], wishlistCount: 0 };
  }
}

export const useCartStore = create<CartState>((set, get) => {
  const init = loadInitial();

  const persist = (next?: Partial<CartState>) => {
    if (typeof window === "undefined") return;
    const s = { ...get(), ...(next || {}) };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ items: s.items, wishlistCount: s.wishlistCount })
    );
  };

  return {
    items: init.items,
    wishlistCount: init.wishlistCount,

    addItem: (item, qty = 1) => {
      set((state) => {
        const i = state.items.findIndex((x) => x.productId === item.productId);
        let items: CartItem[];
        if (i >= 0) {
          items = [...state.items];
          items[i] = { ...items[i], qty: items[i].qty + qty };
        } else {
          items = [...state.items, { ...item, qty }];
        }
        const next = { items } as Partial<CartState>;
        persist(next);
        return next as any;
      });
    },

    removeItem: (productId) =>
      set((state) => {
        const next = { items: state.items.filter((i) => i.productId !== productId) };
        persist(next);
        return next as any;
      }),

    setQty: (productId, qty) =>
      set((state) => {
        const q = Math.max(1, qty);
        const next = {
          items: state.items.map((i) => (i.productId === productId ? { ...i, qty: q } : i)),
        };
        persist(next);
        return next as any;
      }),

    clear: () => {
      const next = { items: [] };
      persist(next);
      set(next as any);
    },

    addWish: () =>
      set((s) => {
        const next = { wishlistCount: s.wishlistCount + 1 };
        persist(next);
        return next as any;
      }),

    get totalQty() {
      return get().items.reduce((a, i) => a + i.qty, 0);
    },

    get subtotal() {
      return Number(get().items.reduce((a, i) => a + i.qty * i.price, 0).toFixed(2));
    },
  };
});
