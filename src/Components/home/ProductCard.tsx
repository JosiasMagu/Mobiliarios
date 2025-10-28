// src/components/home/ProductCard.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "@model/product.model";
import { Eye, Heart, ShoppingCart, Check } from "lucide-react";
import { currency } from "@utils/currency";
import { Stars } from "@utils/rating";
import { useCartStore } from "@state/cart.store";
import { BASE } from "@utils/api";

const PLACEHOLDER = "/placeholder.jpg";
// antes: `${BASE}/api/img?url=${encodeURIComponent(u)}`
const proxify = (u?: string) => (u ? u : PLACEHOLDER);


function firstUrl(p: any): string | undefined {
  if (Array.isArray(p?.images) && p.images.length) {
    const v = p.images[0];
    return typeof v === "string" ? v : v?.url;
  }
  return p?.image;
}

export function ProductCard({
  p,
  onAddCart,
  onAddWish,
}: {
  p: Product;
  onAddCart: (id: number) => void;
  onAddWish: (id: number) => void;
}) {
  const navigate = useNavigate();
  const cart = useCartStore();
  const img = useMemo(() => firstUrl(p), [p]);

  // controla fallback apenas uma vez para evitar loops
  const [broken, setBroken] = useState(false);
  const [toast, setToast] = useState(false);

  const inStock = (p as any).inStock ?? Number((p as any).stock ?? 0) > 0;
  const to = `/p/${(p as any).id}`;
  const src = broken ? PLACEHOLDER : proxify(img);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) return;
    onAddCart(Number((p as any).id));
    cart.addItem(
      {
        productId: Number((p as any).id),
        name: (p as any).name,
        price: Number((p as any).price),
        image: img,
      },
      1
    );
    setToast(true);
    window.setTimeout(() => setToast(false), 1200);
  };

  return (
    <div className="relative rounded-2xl border bg-white overflow-hidden hover:shadow-sm transition">
      <div className="relative">
        <Link to={to} aria-label={`Ver produto ${p.name}`}>
          <img
            src={src}
            onError={() => setBroken(true)}
            alt={p.name || "Produto"}
            loading="lazy"
            className="w-full h-56 object-cover"
          />
        </Link>

        <div className="absolute top-3 right-3 grid gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddWish(Number((p as any).id));
              navigate("/wishlist");
            }}
            className="p-1.5 rounded-md bg-white/90 hover:bg-white shadow"
            aria-label="Adicionar à lista de desejos"
          >
            <Heart className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate(to);
            }}
            className="p-1.5 rounded-md bg-white/90 hover:bg-white shadow"
            aria-label="Ver detalhes"
          >
            <Eye className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <Link to={to} className="block group">
          <h3 className="font-medium line-clamp-1 group-hover:underline">{p.name}</h3>
        </Link>

        <div className="mt-1">
          <Stars rating={(p as any).rating} />
        </div>
        <div className="text-xs text-slate-500">{(p as any).reviews ?? 0} avaliações</div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold">{currency(Number((p as any).price))}</span>
        </div>

        <button
          onClick={handleAdd}
          disabled={!inStock}
          className={`mt-4 w-full rounded-md py-2 text-sm font-semibold flex items-center justify-center gap-2 ${
            inStock ? "bg-slate-900 text-white hover:opacity-95" : "bg-slate-200 text-slate-500 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {inStock ? "Adicionar ao carrinho" : "Sem estoque"}
        </button>
      </div>

      {toast && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[60] rounded-md bg-slate-900 text-white px-3 py-2 text-sm shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4" /> Adicionado ao carrinho
        </div>
      )}
    </div>
  );
}
