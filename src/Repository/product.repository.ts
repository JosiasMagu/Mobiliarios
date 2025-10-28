import { httpGet } from "@/Utils/api";
import type { Product as ModelProduct } from "@/Model/product.model";

// A API pode retornar imagens como array de strings OU objetos { id, url, thumbUrl }
type ApiImage = string | { id?: number; url?: string; thumbUrl?: string };
type ApiCategory = { id: number; slug: string; name: string } | null | undefined;

type ApiProduct = {
  id: number | string;
  name: string;
  slug: string;
  price: number | string;
  stock?: number | string | null;
  active?: boolean | null;
  image?: string | null;
  images?: ApiImage[] | null;
  categoryId: number | string;
  category?: ApiCategory;
};

// Converte qualquer formato de imagem para string[]
function normalizeImages(inp?: ApiImage[] | null): string[] {
  if (!inp || !Array.isArray(inp)) return [];
  return inp
    .map((it) => {
      if (typeof it === "string") return it;
      if (it && typeof it === "object") return it.url || it.thumbUrl || "";
      return "";
    })
    .filter(Boolean);
}

function normalize(p: ApiProduct): ModelProduct {
  const stock = Number(p.stock ?? 0);
  const imgs = normalizeImages(p.images);
  const primary = typeof p.image === "string" && p.image ? p.image : imgs[0];

  const norm: any = {
    id: Number(p.id),
    name: String(p.name),
    slug: String(p.slug),
    price: Number(p.price),
    stock,
    inStock: stock > 0,
    active: Boolean(p.active ?? true),
    image: primary || null,
    images: imgs,
    categoryId: Number(p.categoryId),
    category: p.category
      ? { id: Number((p as any).category.id), slug: String((p as any).category.slug), name: String((p as any).category.name) }
      : undefined,
  };

  return norm as ModelProduct;
}

export async function listProducts(): Promise<ModelProduct[]> {
  const raw = await httpGet<ApiProduct[]>("/api/products");
  return (raw ?? []).map(normalize);
}

export async function getProduct(idOrSlug: string | number): Promise<ModelProduct | null> {
  const raw = await httpGet<any>(`/api/products/${idOrSlug}`);
  const p: ApiProduct | undefined = raw?.product ?? raw;
  return p ? normalize(p) : null;
}

export async function listByCategory(slug: string): Promise<ModelProduct[]> {
  const s = slug.trim();
  if (!s) return [];
  try {
    const raw = await httpGet<ApiProduct[]>(`/api/products?cat=${encodeURIComponent(s)}`);
    return (raw ?? []).map(normalize);
  } catch {
    const all = await listProducts();
    const sl = s.toLowerCase();
    return all.filter((p: any) => String(p.category?.slug ?? "").toLowerCase() === sl);
  }
}

export async function searchProducts(q: string): Promise<ModelProduct[]> {
  const s = q.trim();
  if (!s) return [];
  try {
    const raw = await httpGet<ApiProduct[]>(`/api/products?q=${encodeURIComponent(s)}`);
    return (raw ?? []).map(normalize);
  } catch {
    const all = await listProducts();
    const sl = s.toLowerCase();
    return all.filter((p: any) => p.name?.toLowerCase().includes(sl));
  }
}
