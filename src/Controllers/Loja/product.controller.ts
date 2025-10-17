// src/Controllers/Loja/product.controller.ts
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@model/product.model";
import { getProduct, listByCategory } from "@service/product.service";

export function useProductController(idParam: string | number) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const minQty = 1;
  const maxQty = 10;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    setQty(1);

    (async () => {
      try {
        const p = await getProduct(idParam);
        if (!alive) return;
        if (!p) {
          setErr("Produto não encontrado");
          setProduct(null);
          setRelated([]);
          return;
        }
        setProduct(p);

        const slug = (p as any).categorySlug ?? (p as any).category?.slug ?? (p as any).categoryName;
        const same = slug ? await listByCategory(slug) : [];
        if (!alive) return;
        setRelated(same.filter((x) => String((x as any).id) !== String((p as any).id)).slice(0, 8));
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Erro ao carregar");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [idParam]);

  const canAdd = useMemo(() => {
    const inStock = Boolean((product as any)?.inStock);
    return Boolean(product) && inStock && qty >= minQty;
  }, [product, qty]);

  return { loading, err, product, related, qty, setQty, minQty, maxQty, canAdd };
}
