// src/Repository/product.repository.ts
import { httpGet } from "@/Utils/api";
import type { Product as ModelProduct } from "@model/product.model";

const PLACEHOLDER = "/assets/placeholder.jpg";

/** slug de categoria (db em lower) -> pasta com inicial maiúscula */
function categoryFolderName(slug: string): string {
  const s = String(slug || "").toLowerCase();
  switch (s) {
    case "cadeiras":   return "Cadeiras";
    case "cama":       return "Cama";
    case "luminarias": return "Luminarias";
    case "mesas":      return "Mesas";
    case "sofas":      return "Sofas";
    case "armarios":   return "Armarios";
    default:           return s ? s[0].toUpperCase() + s.slice(1) : "Sofas";
  }
}

/** Índice de assets por categoria. Arquivo: /assets/_index.json */
type AssetsIndex = Record<string, string[]>;
let assetsIndexCache: AssetsIndex | null = null;
/** Mapa opcional slug-do-produto -> caminho relativo. Arquivo: /assets/_index_map.json */
let assetMap: Record<string, string> | null = null;

async function loadAssetsIndex(): Promise<AssetsIndex> {
  if (assetsIndexCache) return assetsIndexCache;
  const v = Date.now();
  const [ix, map] = await Promise.all([
    fetch(`/assets/_index.json?v=${v}`, { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({} as AssetsIndex)),
    fetch(`/assets/_index_map.json?v=${v}`, { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({} as Record<string, string>)),
  ]);
  assetsIndexCache = ix || {};
  assetMap = map || {};
  return assetsIndexCache;
}

/** FNV-1a para distribuição determinística */
function hashSlug(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

/** slugify quando não há slug */
function slugify(x: string): string {
  return String(x || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** escolhe arquivo do produto com preferências: mapa -> pasta categoria -> fallback Sofas -> placeholder */
function pickFileForProduct(catFolder: string, prodSlug: string, ix: AssetsIndex): string {
  // 1) mapeamento manual
  if (assetMap && assetMap[prodSlug]) {
    const rel = assetMap[prodSlug];
    return rel.startsWith("/assets/") ? rel : `/assets/${rel}`;
  }

  // 2) pasta da categoria
  let list = ix[catFolder] || [];

  // 3) fallback global se categoria vazia
  if (!list.length && ix["Sofas"]?.length) { catFolder = "Sofas"; list = ix["Sofas"]; }

  if (!list.length) return PLACEHOLDER;

  // 4) escolhe determinístico; priorize .webp se existir par
  const idx = hashSlug(prodSlug) % list.length;
  let file = list[idx];

  // se houver par .webp do mesmo nome base, usa .webp
  const base = file.replace(/\.(jpe?g|png)$/i, "");
  const candidateWebp = `${base}.webp`;
  if (list.includes(candidateWebp)) file = candidateWebp;

  return `/assets/${catFolder}/${file}`;
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
  const catFolder = categoryFolderName(categorySlug);

  const rawSlug = String(p?.slug ?? "").trim();
  const byName = p?.name ? slugify(String(p.name)) : "";
  const byId = p?.id != null ? String(p.id) : "";
  const productSlug = (rawSlug || byName || byId || `item-${byId}`).toLowerCase();

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
  const ix = await loadAssetsIndex();
  const raw = await httpGet<any[]>(`/api/products?cat=${encodeURIComponent(slug)}`).catch(() => []);
  return (raw ?? []).map((p) => normalizeSync(p, ix));
}

export async function searchProducts(q: string): Promise<ModelProduct[]> {
  const ix = await loadAssetsIndex();
  const raw = await httpGet<any[]>(`/api/products?q=${encodeURIComponent(q)}`).catch(() => []);
  return (raw ?? []).map((p) => normalizeSync(p, ix));
}
