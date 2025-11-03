// src/Components/home/ProductGrid.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@model/product.model";
import { X, Search } from "lucide-react";
import { ProductCard } from "./ProductCard";

const PLACEHOLDER = "/assets/placeholder.jpg";

// ---- helpers locais ----
function toStrArray(x: unknown): string[] {
  return Array.isArray(x) ? (x.filter(Boolean) as unknown[]).map(String) : [];
}
function onlyLocal(u?: string | null): string | null {
  if (!u) return null;
  const s = String(u);
  return s.startsWith("/assets/") ? s : null;
}

// Carrossel dentro da seção de produtos
function SectionCarousel({ images }: { images: string[] }) {
  const list = useMemo(
    () => images.filter(Boolean),
    [images]
  );
  const [i, setI] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!list.length) return;
    timer.current = window.setInterval(
      () => setI((x) => (x + 1) % list.length),
      3000
    ) as unknown as number;
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [list.length]);

  const cur = list[i] || PLACEHOLDER;

  return (
    <div className="relative w-full h-56 sm:h-64 md:h-72 overflow-hidden rounded-xl bg-slate-100 mt-8">
      <img
        key={cur}
        src={cur}                 // usa direto, só local
        alt="Destaques"
        className="w-full h-full object-cover transition-opacity duration-700"
        loading="lazy"
        decoding="async"
      />
      {list.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {Array.from({ length: Math.min(list.length, 8) }).map((_, k) => (
            <span
              key={k}
              className={`h-1.5 w-1.5 rounded-full ${
                k === (i % Math.min(list.length, 8)) ? "bg-white" : "bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductGrid({
  list,
  searchQuery,
  setSearchQuery,
  onAddCart,
  onAddWish,
}: {
  list: Product[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onAddCart: (id: number) => void;
  onAddWish: (id: number) => void;
}) {
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? list.filter((p: any) => String(p.name).toLowerCase().includes(q))
    : list;

  // imagens do carrossel da seção: SOMENTE locais resolvidas pelo repositório
  const carouselImgs = useMemo(() => {
    const pool: string[] = [];

    (list ?? []).forEach((p: any) => {
      const rel = toStrArray(p.imagesRel);           // preferencial
      const prim = onlyLocal(p.imageRel);            // primaria local
      const validRel = rel.map(onlyLocal).filter(Boolean) as string[];

      if (prim) pool.push(prim);
      pool.push(...validRel);
    });

    const uniq = Array.from(new Set(pool)).filter(Boolean);
    return (uniq.length ? uniq : [PLACEHOLDER]).slice(0, 20);
  }, [list]);

  return (
    <section id="products" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Destaques</h2>
          <p className="text-slate-600 mt-2">Seleção curada com design e qualidade.</p>

          <SectionCarousel images={carouselImgs} />

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
                  aria-label="Limpar pesquisa"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard
              key={(p as any).id}
              p={p}
              onAddCart={onAddCart}
              onAddWish={onAddWish}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
