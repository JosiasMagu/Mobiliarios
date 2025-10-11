import { useEffect, useMemo, useState } from "react";
import type { Product } from "@model/product.model";
import { listByCategory } from "@repo/product.repository";

export type SortKey = "bestsellers" | "newest" | "priceAsc" | "priceDesc";

export function useCategoryController(slug: string) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<Product[]>([]);

  const [q, setQ] = useState("");
  const [inStock, setInStock] = useState(false);
  const [min, setMin] = useState<string>("");
  const [max, setMax] = useState<string>("");
  const [color, setColor] = useState<string | null>(null);
  const [material, setMaterial] = useState<string | null>(null);

  const [sort, setSort] = useState<SortKey>("bestsellers");

  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    setPage(1);
    (async () => {
      try {
        const data = await listByCategory(slug);
        if (!alive) return;
        setItems(data);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Erro ao carregar");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  const filtered = useMemo(() => {
    const name = q.trim().toLowerCase();
    const minN = Number(min);
    const maxN = Number(max);
    return items.filter(p => {
      const inStockFlag = Boolean((p as any).inStock);
      const colors: string[] = ((p as any).colors ?? []) as string[];
      if (name && !p.name.toLowerCase().includes(name)) return false;
      if (inStock && !inStockFlag) return false;
      if (!Number.isNaN(minN) && min !== "" && Number(p.price) < minN) return false;
      if (!Number.isNaN(maxN) && max !== "" && Number(p.price) > maxN) return false;
      if (color && !colors.some(c => c.toLowerCase() === color.toLowerCase())) return false;
      if (material) { /* reservado */ }
      return true;
    });
  }, [items, q, inStock, min, max, color, material]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "priceAsc":  arr.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "priceDesc": arr.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case "newest":    arr.sort((a, b) => Number((b as any).isNew ?? 0) - Number((a as any).isNew ?? 0)); break;
      case "bestsellers":
      default: {
        const r = (x: any) => Number(x?.reviews ?? 0);
        arr.sort((a, b) => r(b) - r(a));
        break;
      }
    }
    return arr;
  }, [filtered, sort]);

  const totalFiltered = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(
    () => sorted.slice((pageSafe - 1) * pageSize, pageSafe * pageSize),
    [sorted, pageSafe]
  );

  const resetFilters = () => {
    setQ(""); setInStock(false); setMin(""); setMax("");
    setColor(null); setMaterial(null); setPage(1);
  };

  const setPriceRange = (r: "r1" | "r2" | "r3" | "r4" | null) => {
    if (r === "r1")      { setMin("0");    setMax("500");  }
    else if (r === "r2") { setMin("500");  setMax("1000"); }
    else if (r === "r3") { setMin("1000"); setMax("2000"); }
    else if (r === "r4") { setMin("2000"); setMax("");     }
    else                 { setMin("");     setMax("");     }
    setPage(1);
  };

  return {
    loading, err, items,
    q, setQ, inStock, setInStock, min, setMin, max, setMax,
    color, setColor, material, setMaterial, resetFilters, setPriceRange,
    sort, setSort,
    page: pageSafe, setPage, totalPages, pageSize, paged,
    totalFiltered,
  };
}
