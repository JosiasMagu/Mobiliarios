import { create } from "zustand";

export type WishItem = {
  productId: number;
  name: string;
  price: number;
  image?: string;
};

type WishlistState = {
  items: WishItem[];
  add: (i: WishItem) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const KEY = "wishlist.v1";

export const useWishlistStore = create<WishlistState>((set, _get) => ({
  items: [],
  add: (i) =>
    set((s) => (s.items.some((x) => x.productId === i.productId) ? s : { items: [...s.items, i] })),
  remove: (productId) => set((s) => ({ items: s.items.filter((x) => x.productId !== productId) })),
  clear: () => set({ items: [] }),
}));

// persist
try {
  const saved = localStorage.getItem(KEY);
  if (saved) (useWishlistStore as any).setState(JSON.parse(saved));
} catch {}
useWishlistStore.subscribe((s) => {
  localStorage.setItem(KEY, JSON.stringify({ items: s.items }));
});
