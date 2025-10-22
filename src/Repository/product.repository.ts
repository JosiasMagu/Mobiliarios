import { httpGet } from "@/Utils/api";
import type { Product as ModelProduct } from "@/Model/product.model";

type ApiProduct = {
  id:number; name:string; slug:string; price:any; stock?:any; active?:boolean;
  image?:string; images?: {id:number; url:string}[]; categoryId:number;
  category?: { id:number; slug:string; name:string };
};

function normalize(p: ApiProduct): ModelProduct {
  const stock = Number(p.stock ?? 0);
  return {
    id: Number(p.id),
    name: String(p.name),
    slug: String(p.slug),
    price: Number(p.price),
    stock,
    inStock: stock > 0,                // <- exigido pelo seu Model
    active: Boolean(p.active ?? true),
    image: p.image,
    images: p.images,
    categoryId: Number(p.categoryId),
    category: p.category,
    // Extras opcionais usados em telas: mantenha se existir no Model
    // categorySlug: p.category?.slug,
  } as unknown as ModelProduct;
}

export async function listProducts(): Promise<ModelProduct[]> {
  const raw = await httpGet<ApiProduct[]>("/api/products");
  return raw.map(normalize);
}

export async function getProduct(id: string | number): Promise<ModelProduct | null> {
  const raw = await httpGet<any>(`/api/products/${id}`);
  // backend pode devolver { product, related }
  const p: ApiProduct | undefined = raw?.product ?? raw;
  return p ? normalize(p) : null;
}

export async function listByCategory(slug: string): Promise<ModelProduct[]> {
  // tenta via API com filtro do servidor
  try {
    const raw = await httpGet<ApiProduct[]>(`/api/products?cat=${encodeURIComponent(slug)}`);
    return raw.map(normalize);
  } catch {
    // fallback: client-side
    const all = await listProducts();
    const s = slug.toLowerCase();
    return all.filter((p: any) => String(p.category?.slug ?? p.categorySlug ?? "").toLowerCase() === s);
  }
}

export async function searchProducts(q: string): Promise<ModelProduct[]> {
  const s = q.trim();
  if (!s) return [];
  // tenta via API (?q=) suportado no backend
  try {
    const raw = await httpGet<ApiProduct[]>(`/api/products?q=${encodeURIComponent(s)}`);
    return raw.map(normalize);
  } catch {
    // fallback: client-side
    const all = await listProducts();
    const sl = s.toLowerCase();
    return all.filter(p => p.name.toLowerCase().includes(sl));
  }
}
