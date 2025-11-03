// src/Repository/product.repository.ts
import { httpGet } from "@/Utils/api";
import type { Product as ModelProduct } from "@model/product.model";

const PLACEHOLDER = "/placeholder.jpg";

function categoryFolderName(slug: string): string {
  const s = String(slug || "").toLowerCase();
  switch (s) {
    case "cadeiras":   return "Cadeiras";
    case "cama":       return "Cama";
    case "luminarias": return "Luminarias";
    case "mesas":      return "Mesas";
    case "sofas":      return "Sofas";
    case "armarios":   return "Armarios"; // temporário: usa Sofas até preencher Armarios
    default:           return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Sofas";
  }
}

// -------- Índice de assets por categoria --------
type AssetsIndex = Record<string, string[]>;
let assetsIndexCache: AssetsIndex | null = null;
let assetsIndexPromise: Promise<AssetsIndex> | null = null;

// em product.repository.ts
async function loadAssetsIndex(): Promise<AssetsIndex> {
  if (assetsIndexCache) return assetsIndexCache;
  const v = Date.now(); // cache-bust
  const ix = await fetch(`/assets/_index.json?v=${v}`, { cache: "no-cache" })
    .then(r => r.ok ? r.json() : {})
    .catch(() => ({} as AssetsIndex));
  assetsIndexCache = ix || {};
  return assetsIndexCache;
}

function hashSlug(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

function pickFileForProduct(catFolder: string, prodSlug: string, ix: AssetsIndex): string {
  const list = ix[catFolder] || [];
  if (!list.length) return PLACEHOLDER;
  const idx = hashSlug(prodSlug) % list.length;
  const filename = list[idx];
  const rel = filename.startsWith("/") ? filename : `/assets/${catFolder}/${filename}`;
  return rel;
}

function normalizeWithLocalImage(p: any, imgPath: string): ModelProduct {
  const stock = Number(p.stock ?? 0);
  const out: any = {
    id: Number(p.id),
    name: String(p.name ?? ""),
    slug: String(p.slug ?? ""),
    price: Number(p.price ?? 0),
    stock,
    inStock: stock > 0,
    image: imgPath || PLACEHOLDER,
    images: [imgPath || PLACEHOLDER],
    imageRel: imgPath || PLACEHOLDER,
    imagesRel: [imgPath || PLACEHOLDER],
    categoryId: Number(p.categoryId ?? 0),
    category: p.category
      ? { id: Number(p.category.id), slug: String(p.category.slug), name: String(p.category.name) }
      : undefined,
  };
  return out as ModelProduct;
}

function normalizeSync(p: any, ix: AssetsIndex): ModelProduct {
  const categorySlug = String(p?.category?.slug ?? "sofas").trim().toLowerCase();
  const productSlug  = String(p?.slug ?? String(p?.id ?? "")).trim().toLowerCase();
  const catFolder = categoryFolderName(categorySlug);
  const mainImg = pickFileForProduct(catFolder, productSlug, ix);
  return normalizeWithLocalImage(p, mainImg);
}

// -------- Endpoints --------
export async function listProducts(): Promise<ModelProduct[]> {
  const [raw, ix] = await Promise.all([
    httpGet<any[]>("/api/products"),
    loadAssetsIndex(),
  ]);
  return (raw ?? []).map((p) => normalizeSync(p, ix));
}

export async function getProduct(idOrSlug: string | number): Promise<ModelProduct | null> {
  const [raw, ix] = await Promise.all([
    httpGet<any>(`/api/products/${encodeURIComponent(String(idOrSlug))}`),
    loadAssetsIndex(),
  ]);
  const p = raw?.product ?? raw;
  return p ? normalizeSync(p, ix) : null;
}

export async function listByCategory(slug: string): Promise<ModelProduct[]> {
  const s = slug.trim();
  if (!s) return [];
  const ix = await loadAssetsIndex();
  try {
    const raw = await httpGet<any[]>(`/api/products?cat=${encodeURIComponent(s)}`);
    return (raw ?? []).map((p) => normalizeSync(p, ix));
  } catch {
    const all = await listProducts();
    const sl = s.toLowerCase();
    return all.filter((p: any) => String(p.category?.slug ?? "").toLowerCase() === sl);
  }
}

export async function searchProducts(q: string): Promise<ModelProduct[]> {
  const s = q.trim();
  if (!s) return [];
  const ix = await loadAssetsIndex();
  try {
    const raw = await httpGet<any[]>(`/api/products?q=${encodeURIComponent(s)}`);
    return (raw ?? []).map((p) => normalizeSync(p, ix));
  } catch {
    const all = await listProducts();
    const sl = s.toLowerCase();
    return all.filter((p: any) => p.name?.toLowerCase().includes(sl));
  }
}
