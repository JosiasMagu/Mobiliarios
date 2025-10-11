import { getJSON, setJSON } from "./storage.service";
import { STORAGE_KEYS } from "../Utils/config";

export type CartItem = {
  productId: string | number;
  name: string;
  price: number;
  qty: number;
  image?: string;
};
export type Cart = { items: CartItem[]; subtotal: number; frete: number; total: number };

function calc(items: CartItem[]): Cart {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const frete = items.length ? 100 : 0;
  const total = subtotal + frete;
  return { items, subtotal, frete, total };
}

export function loadCart(): Cart {
  const saved = getJSON<Cart>(STORAGE_KEYS.CART, { items: [], subtotal: 0, frete: 0, total: 0 });
  return calc(saved.items);
}
export function saveCart(cart: Cart) {
  setJSON(STORAGE_KEYS.CART, cart);
}

export const CartService = {
  get(): Cart {
    return loadCart();
  },
  clear(): Cart {
    const next = calc([]);
    saveCart(next);
    return next;
  },
  add(item: CartItem): Cart {
    const c = loadCart();
    const idx = c.items.findIndex(i => String(i.productId) === String(item.productId));
    if (idx >= 0) c.items[idx].qty += item.qty;
    else c.items.push(item);
    const next = calc(c.items);
    saveCart(next);
    return next;
    },
  updateQty(productId: string | number, qty: number): Cart {
    const c = loadCart();
    c.items = c.items
      .map(i => (String(i.productId) === String(productId) ? { ...i, qty } : i))
      .filter(i => i.qty > 0);
    const next = calc(c.items);
    saveCart(next);
    return next;
  },
  remove(productId: string | number): Cart {
    const c = loadCart();
    c.items = c.items.filter(i => String(i.productId) !== String(productId));
    const next = calc(c.items);
    saveCart(next);
    return next;
  },
};
