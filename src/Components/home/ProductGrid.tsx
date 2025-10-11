import type { Product } from "@model/product.model";
import { X, Search } from "lucide-react";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  list,
  searchQuery,
  setSearchQuery,
  onAddCart,
  onAddWish
}: {
  list: Product[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onAddCart: (id: number) => void;
  onAddWish: (id: number) => void;
}) {
  return (
    <section id="products" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Destaques</h2>
          <p className="text-slate-600 mt-2">Seleção curada com design e qualidade.</p>
          <div className="mt-6 flex justify-center">
            <div className="relative w-full max-w-lg">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por nome..."
                className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-8 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} onAddCart={onAddCart} onAddWish={onAddWish} />
          ))}
        </div>
      </div>
    </section>
  );
}
