// src/components/home/ProductCard.tsx  (apenas troque por este)
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@model/product.model";
import { Eye, Heart, ShoppingCart, Check } from "lucide-react";
import { currency } from "@utils/currency";
import { Stars } from "@utils/rating";

export function ProductCard({
  p,
  onAddCart,
  onAddWish,
}: {
  p: Product;
  onAddCart: (id: number) => void;
  onAddWish: (id: number) => void;
}) {
  const image = (p as any).image ?? (p as any).images?.[0];
  const [toast, setToast] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((p as any).inStock) {
      onAddCart(Number(p.id));
      setToast(true);
      window.setTimeout(() => setToast(false), 1400);
    }
  };

  return (
    <div className="relative rounded-2xl border bg-white overflow-hidden hover:shadow-sm transition">
      <div className="relative">
        <Link to={`/p/${p.id}`} aria-label={`Ver produto ${p.name}`}>
          <img src={image} alt={p.name} className="w-full h-56 object-cover" loading="lazy" />
        </Link>

        <div className="absolute top-3 left-3 flex gap-2">
          {(p as any).isNew && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white">Novo</span>
          )}
          {(p as any).discount && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-pink-600 text-white">
              -{(p as any).discount}%
            </span>
          )}
          {!(p as any).inStock && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-900/80 text-white">
              Indisponível
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 grid gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddWish(Number(p.id));
            }}
            className="p-1.5 rounded-md bg-white/90 hover:bg-white shadow"
            aria-label="Favoritar"
          >
            <Heart className="w-4 h-4 text-slate-700" />
          </button>
          <Link to={`/p/${p.id}`} className="p-1.5 rounded-md bg-white/90 hover:bg-white shadow" aria-label="Ver rapidamente">
            <Eye className="w-4 h-4 text-slate-700" />
          </Link>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/p/${p.id}`} className="block group">
          <h3 className="font-medium line-clamp-1 group-hover:underline">{p.name}</h3>
        </Link>

        <div className="mt-1">
          <Stars rating={(p as any).rating} />
        </div>
        <div className="text-xs text-slate-500">{(p as any).reviews ?? 0} avaliações</div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold">{currency(Number(p.price))}</span>
          {(p as any).originalPrice && (
            <span className="text-xs text-slate-400 line-through">
              {currency(Number((p as any).originalPrice))}
            </span>
          )}
        </div>

        {(p as any).colors?.length ? (
          <div className="mt-3 flex items-center gap-2">
            {(p as any).colors.map((c: string) => (
              <button
                key={c}
                onClick={(e) => e.preventDefault()}
                className="w-5 h-5 rounded-full border border-white shadow"
                style={{ backgroundColor: c }}
                aria-label={`Selecionar cor ${c}`}
                title={`Cor ${c}`}
              />
            ))}
          </div>
        ) : null}

        <button
          onClick={handleAdd}
          disabled={!(p as any).inStock}
          className={`mt-4 w-full rounded-md py-2 text-sm font-semibold flex items-center justify-center gap-2 ${
            (p as any).inStock
              ? "bg-slate-900 text-white hover:opacity-95"
              : "bg-slate-200 text-slate-500 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {(p as any).inStock ? "Adicionar ao carrinho" : "Sem estoque"}
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
