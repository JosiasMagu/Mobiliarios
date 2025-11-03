// src/Repository/product.repository.ts
import { httpGet } from "@/Utils/api";
import type { Product as ModelProduct } from "@model/product.model";

// Placeholder fixo
const PLACEHOLDER = "/assets/placeholder.jpg";

function categoryFolderName(slug: string): string {
  const s = String(slug || "").toLowerCase();
  switch (s) {
    case "cadeiras":   return "Cadeiras";
    case "cama":       return "Cama";
    case "luminarias": return "Luminarias";
    case "mesas":      return "Mesas";
    case "sofas":      return "Sofas";
    case "armarios":   return "Sofas"; // <— usa a pasta Sofas para “armarios”
    default:           return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Sofas";
  }
}

// -------- Índice de assets por categoria --------
// Espera o ficheiro: /public/assets/_index.json
// Formato:
// {
//   "Cadeiras": ["daniil-....jpg","dillon-....jpg", ...],
//   "Cama": ["adly-hakim-....jpg", ...],
//   "Luminarias": [...],
//   "Mesas": [...],
//   "Sofas": [...]
// }
type AssetsIndex = Record<string, string[]>;
let assetsIndexCache: AssetsIndex | null = null;
let assetsIndexPromise: Promise<AssetsIndex> | null = null;

async function loadAssetsIndex(): Promise<AssetsIndex> {
  if (assetsIndexCache) return assetsIndexCache;
  if (!assetsIndexPromise) {
    assetsIndexPromise = fetch("/assets/_index.json", { cache: "no-cache" })
      .then(async (r) => (r.ok ? ((await r.json()) as AssetsIndex) : {}))
      .catch(() => ({}))
      .then((ix) => (assetsIndexCache = ix || {}));
  }
  return assetsIndexPromise;
}

// Hash determinístico simples do slug para distribuir pelos ficheiros
function hashSlug(s: string): number {
  let h = 2166136261 >>> 0; // FNV-1a 32-bit base
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
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
    categoryId: Number(p.categoryId ?? 0),
    category: p.category
      ? {
          id: Number(p.category.id),
          slug: String(p.category.slug),
          name: String(p.category.name),
        }
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
    httpGet<any>(`/api/products/${idOrSlug}`),
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
