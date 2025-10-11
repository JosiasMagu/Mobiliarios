import { useEffect, useState } from "react";
import type { Cart, CartItem } from "../../Services/cart.service";
import { CartService } from "../../Services/cart.service";

export function useCartController() {
  const [cart, setCart] = useState<Cart>(() => CartService.get());

  useEffect(() => {
    // garante hidratação inicial se outro tab alterar storage
    setCart(CartService.get());
  }, []);

  function add(item: CartItem) {
    setCart(CartService.add(item));
  }
  function updateQty(productId: string, qty: number) {
    setCart(CartService.updateQty(productId, qty));
  }
  function remove(productId: string) {
    setCart(CartService.remove(productId));
  }
  function clear() {
    setCart(CartService.clear());
  }

  return { cart, add, updateQty, remove, clear };
}
