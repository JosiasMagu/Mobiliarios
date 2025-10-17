// src/Repository/product.repository.ts
import data from "@data/products.mock.json";
import type { Product } from "@model/product.model";

function normalize(p: any): Product {
  return {
    id: Number(p.id),
    name: String(p.name),
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
    image: p.image ?? undefined,
    images: Array.isArray(p.images) ? (p.images as string[]) : undefined,
    gallery: Array.isArray(p.gallery) ? (p.gallery as string[]) : undefined,
    rating: p.rating != null ? Number(p.rating) : 4.5,
    reviews: p.reviews != null ? Number(p.reviews) : 0,
    isNew: Boolean(p.isNew),
    discount: p.discount != null ? Number(p.discount) : undefined,
    colors: Array.isArray(p.colors) ? (p.colors as string[]) : [],
    inStock: Boolean(p.inStock),
    categorySlug: p.categorySlug ?? undefined,
  } as any;
}

const ALL: Product[] = (data as any[]).map(normalize);

export async function getProduct(id: string | number): Promise<Product | null> {
  const pid = String(id);
  return ALL.find((p) => String(p.id) === pid) ?? null;
}

export async function listByCategory(slug: string): Promise<Product[]> {
  const s = String(slug).toLowerCase();
  return ALL.filter((p: any) => String(p.categorySlug ?? "").toLowerCase() === s);
}

export async function listProducts(): Promise<Product[]> {
  return ALL;
}

export async function searchProducts(q: string): Promise<Product[]> {
  const name = q.trim().toLowerCase();
  if (!name) return [];
  return ALL.filter((p) => p.name.toLowerCase().includes(name));
}
