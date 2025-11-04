// src/Components/home/ProductCard.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "@model/product.model";
import { Eye, Heart, ShoppingCart, Check } from "lucide-react";
import { currency } from "@utils/currency";
import { Stars } from "@utils/rating";
import { useCartStore } from "@state/cart.store";

const PLACEHOLDER = "/assets/placeholder.jpg";

function resolveImg(u?: string) {
  if (!u) return PLACEHOLDER;
  const s = String(u).trim();
  if (!s) return PLACEHOLDER;
  if (s.startsWith("data:") || s.startsWith("blob:")) return s;
  if (/^https?:\/\//i.test(s)) return `/api/img?url=${encodeURIComponent(s)}`;
  if (s.startsWith("/")) return s;
  if (s.startsWith("assets/")) return `/${s}`;
  return `/assets/${s}`;
}

type Props = {
  p: Product;
  onAddCart: (id: number) => void;
  onAddWish: (id: number) => void;
};

function pickPrimary(p: Product): string {
  if ((p as any)?.imageRel) return resolveImg(String((p as any).imageRel));
  if (Array.isArray((p as any)?.imagesRel) && (p as any).imagesRel[0]) return resolveImg(String((p as any).imagesRel[0]));
  if (Array.isArray(p?.images) && p.images[0]) return resolveImg(String(p.images[0]));
  if (p?.image) return resolveImg(String(p.image));
  return PLACEHOLDER;
}

function collectImages(p: Product): string[] {
  const out: string[] = [];
  if (Array.isArray((p as any)?.imagesRel)) out.push(...(p as any).imagesRel.map((x: any) => resolveImg(String(x))).filter(Boolean));
  if ((p as any)?.imageRel) out.push(resolveImg(String((p as any).imageRel)));
  if (Array.isArray(p?.images)) out.push(...p.images.map((x: any) => resolveImg(String(x))).filter(Boolean));
  if (p?.image) out.push(resolveImg(String(p.image)));
  return Array.from(new Set(out.filter(Boolean))).slice(0, 8);
}

export function ProductCard({ p, onAddCart, onAddWish }: Props) {
  const navigate = useNavigate();
  const cart = useCartStore();

  const initial = React.useMemo(() => pickPrimary(p), [p]);
  const allImgs = React.useMemo(() => {
    const imgs = collectImages(p);
    return imgs.length ? imgs : [PLACEHOLDER];
  }, [p]);

  const [idx, setIdx] = React.useState(0);
  const src = allImgs[Math.min(idx, allImgs.length - 1)] ?? PLACEHOLDER;

  const inStock = (p as any).inStock ?? Number((p as any).stock ?? 0) > 0;
  const to = `/p/${(p as any).slug || (p as any).id}`;

  const [toast, setToast] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) return;
    onAddCart(Number((p as any).id));
    cart.addItem(
      {
        productId: Number((p as any).id),
        name: (p as any).name,
        price: Number((p as any).price),
        image: initial || src || PLACEHOLDER,
      },
      1
    );
    setToast(true);
    window.setTimeout(() => setToast(false), 1200);
  };

  return (
    <div className="relative rounded-2xl border bg-white overflow-hidden hover:shadow-sm transition" style={{ contentVisibility: "auto" }}>
      <div className="relative">
        <Link to={to} aria-label={`Ver produto ${p.name}`}>
          <img
            src={src}
            alt={p.name || "Produto"}
            loading="lazy"
            decoding="async"
            className="w-full h-56 object-cover"
            onError={(e) => {
              const imgEl = e.currentTarget as HTMLImageElement;
              if (idx + 1 < allImgs.length) setIdx(idx + 1);
              else imgEl.src = PLACEHOLDER;
            }}
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

        <div className="mt-1"><Stars rating={(p as any).rating} /></div>
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
