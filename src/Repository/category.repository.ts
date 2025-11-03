// src/Repository/category.repository.ts
import {
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  httpPut,
} from "@/Utils/api";
import type { Category as ModelCategory } from "@model/category.model";
import { buildLocalImagesFor } from "@/Utils/img";

/* =========================================================
   PRODUTOS (mantidos para compat em páginas que usam ambos)
   ========================================================= */

export type ApiImage = string | { id?: number; url?: string; thumbUrl?: string };

export type ApiProduct = {
  id: number | string;
  name: string;
  slug: string;
  price: number | string;
  stock?: number | string | null;
  active?: boolean | null;
  image?: string | null;
  images?: ApiImage[] | null;
  categoryId: number | string;
  category?: { id: number; slug: string; name: string } | null;
};

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

export function normalizeProduct(p: ApiProduct) {
  const stock = Number(p.stock ?? 0);
  const imgsRemote = normalizeImages(p.images);
  const primaryRemote =
    typeof p.image === "string" && p.image ? p.image : imgsRemote[0];

  const categorySlug = String(p.category?.slug ?? "").toLowerCase();
  const local = buildLocalImagesFor({
    id: Number(p.id),
    slug: String(p.slug ?? ""),
    categorySlug,
  });

  const imgsFinal = local.images.length ? local.images : imgsRemote;
  const primaryFinal = local.primary ?? primaryRemote ?? null;

  return {
    id: Number(p.id),
    name: String(p.name),
    slug: String(p.slug),
    price: Number(p.price),
    stock,
    inStock: stock > 0,
    active: Boolean(p.active ?? true),

    image: primaryFinal || null,
    images: imgsFinal,

    categoryId: Number(p.categoryId),
    category: p.category
      ? {
          id: Number((p as any).category.id),
          slug: String((p as any).category.slug),
          name: String((p as any).category.name),
        }
      : undefined,
    categorySlug,

    imageRel: local.primary ?? undefined,
    imagesRel: local.images.length ? local.images : undefined,
  };
}

/* ============================
   CATEGORIES (alinhado ao Model)
   ============================ */

const API_BASE = "/api/categories";
const ADMIN_BASE = "/api/categories/admin";

/** Mapeia dados crus da API (numéricos) para o tipo ModelCategory (strings, datas válidas) */
function mapApiToModel(c: { id: number; name: string; slug: string; position?: number }): ModelCategory {
  const now = new Date().toISOString();
  return {
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    position: c.position ?? 0,
    parentId: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

export async function listCategories(): Promise<ModelCategory[]> {
  const raw = await httpGet<Array<{ id: number; name: string; slug: string; position?: number }>>(`${API_BASE}`);
  return (raw ?? []).map(mapApiToModel);
}

export async function getCategoryBySlug(slug: string): Promise<ModelCategory | null> {
  const all = await listCategories();
  const sl = slug.trim().toLowerCase();
  return all.find((c) => c.slug.toLowerCase() === sl) ?? null;
}

export async function createCategory(payload: {
  name: string;
  slug: string;
  position?: number;
  parentId?: string | null;
}): Promise<ModelCategory> {
  const r = await httpPost<{ id: number; name: string; slug: string; position?: number }>(`${ADMIN_BASE}`, {
    name: payload.name,
    slug: payload.slug,
    position: payload.position ?? 0,
  });
  return mapApiToModel(r);
}

export async function updateCategory(
  id: string | number,
  patch: Partial<{ name: string; slug: string; position?: number; parentId?: string | null }>
): Promise<ModelCategory> {
  const rid = Number(id);
  const r = await httpPatch<{ id: number; name: string; slug: string; position?: number }>(`${ADMIN_BASE}/${rid}`, {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
    ...(patch.position !== undefined ? { position: Number(patch.position) } : {}),
  });
  return mapApiToModel(r);
}

export async function upsertCategory(payload: {
  id?: string | number;
  name: string;
  slug: string;
  position?: number;
  parentId?: string | null;
}) {
  if (payload.id && Number(payload.id) > 0) {
    return updateCategory(payload.id, {
      name: payload.name,
      slug: payload.slug,
      position: payload.position,
      parentId: payload.parentId ?? null,
    });
  }
  return createCategory({
    name: payload.name,
    slug: payload.slug,
    position: payload.position,
    parentId: payload.parentId ?? null,
  });
}

export async function deleteCategory(id: string | number): Promise<void> {
  await httpDelete<void>(`${ADMIN_BASE}/${Number(id)}`);
}

export async function reorderCategories(idsInOrder: Array<{ id: string | number; position: number }>|number[]): Promise<void> {
  const ids =
    Array.isArray(idsInOrder) && typeof (idsInOrder as any)[0] === "object"
      ? (idsInOrder as Array<{ id: string | number; position: number }>)
          .sort((a, b) => a.position - b.position)
          .map((x) => Number(x.id))
      : (idsInOrder as number[]).map((n) => Number(n));

  await httpPut<void>(`${ADMIN_BASE}/reorder`, { ids });
}

export const CategoryRepository = {
  listCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  upsertCategory,
  deleteCategory,
  reorderCategories,
};

export default CategoryRepository;
