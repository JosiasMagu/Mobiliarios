import React from "react";
import { Heart, Share2 } from "lucide-react";
import { currency } from "@utils/currency";

type Props = {
  name: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  isNew?: boolean;
  discount?: number;
  colors?: string[];
  qty: number;
  minQty: number;
  maxQty: number;
  canAdd: boolean;
  setQty: (n: number) => void;
  onAdd: () => void;
};

export function BuyBox({
  name, price, originalPrice, inStock, isNew, discount, colors,
  qty, minQty, maxQty, canAdd, setQty, onAdd,
}: Props) {
  return (
    <div className="lg:sticky lg:top-24">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{name}</h1>

      <p className="mt-3 text-slate-600">
        Peça com design moderno, materiais selecionados e conforto para uso diário.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isNew && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">Novo</span>}
        {typeof discount === "number" && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-pink-600 text-white">-{discount}%</span>
        )}
        {!inStock && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/80 text-white">Indisponível</span>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <div className="text-3xl font-bold">{currency(price)}</div>
        {originalPrice && <div className="text-sm text-slate-400 line-through">{currency(originalPrice)}</div>}
        <div className="text-sm text-slate-500">em até 12x sem juros</div>
      </div>

      {/* Cores */}
      {colors?.length ? (
        <div className="mt-5">
          <div className="text-sm font-medium text-slate-700 mb-2">Cores</div>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                className="w-6 h-6 rounded-full border border-white shadow"
                style={{ backgroundColor: c }}
                title={`Cor ${c}`}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Ações */}
      <div className="mt-6 flex items-center gap-3">
        <div className="inline-flex items-center rounded-md border">
          <button
            onClick={() => setQty(Math.max(minQty, qty - 1))}
            className="px-3 py-2 hover:bg-slate-50"
            aria-label="Diminuir quantidade"
          >−</button>
          <input
            value={qty}
            onChange={(e) => {
              const n = Number(e.target.value);
              const v = Number.isNaN(n) ? minQty : Math.max(minQty, Math.min(maxQty, n));
              setQty(v);
            }}
            type="number"
            min={minQty}
            max={maxQty}
            className="w-16 text-center py-2 outline-none"
          />
          <button
            onClick={() => setQty(Math.min(maxQty, qty + 1))}
            className="px-3 py-2 hover:bg-slate-50"
            aria-label="Aumentar quantidade"
          >+</button>
        </div>

        <button
          disabled={!canAdd}
          onClick={onAdd}
          className={`flex-1 px-6 py-3 rounded-md text-white font-semibold ${
            canAdd ? "bg-slate-900 hover:opacity-95" : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          Adicionar ao carrinho
        </button>

        <button className="p-2 rounded-md border hover:bg-slate-50" aria-label="Favoritar">
          <Heart className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-md border hover:bg-slate-50" aria-label="Partilhar">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
