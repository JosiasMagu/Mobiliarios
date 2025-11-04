// src/Services/product.service.ts
import type {
  PagedResult,
  Product,
  ProductCreate,
  ProductQuery,
  ProductUpdate,
} from "@/Model/product.model";
import {
  getProduct as repoGetProduct,
  listByCategory as repoListByCategory,
  listProducts as repoListAll,
  searchProducts as repoSearch,
} from "@/Repository/product.repository";

// Base da API com default local
const API_BASE = ((import.meta as any)?.env?.VITE_API_URL ?? "http://localhost:8080")
  .toString()
  .replace(/\/+$/, "");

const MEM_KEY = "mobiliario.admin.products";

// ---------------- Persistência mock p/ dev sem API ----------------
function loadMem(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(MEM_KEY) || "[]") as Product[];
  } catch {
    return [];
  }
}
function saveMem(list: Product[]) {
  localStorage.setItem(MEM_KEY, JSON.stringify(list));
}
async function seedIfEmpty() {
  const cur = loadMem();
  if (cur.length === 0) {
    const mock = await repoListAll();
    const now = new Date().toISOString();
    const seeded = mock.map<Product>((p: any) => ({
      ...p,
      stockQty: p.stockQty ?? (p.inStock ? 10 : 0),
      status: p.status ?? (p.inStock ? "published" : "draft"),
      categoryName: p.categorySlug ?? p.category?.slug,
      createdAt: now,
      updatedAt: now,
    }));
    saveMem(seeded);
  }
}
function genIdNumber(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}
void seedIfEmpty();

// ---------------- Helper HTTP ----------------
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ================= Loja (read-only) =================
// Sempre via REPOSITÓRIO para normalizar imagens locais (/assets) e placeholders,
// independentemente de a API estar ativa.
export async function getProduct(idOrSlug: string | number): Promise<Product | null> {
  return repoGetProduct(idOrSlug);
}
export async function listByCategory(slug: string): Promise<Product[]> {
  return repoListByCategory(slug);
}
export async function listAllProducts(): Promise<Product[]> {
  return repoListAll();
}
export async function searchProducts(q: string): Promise<Product[]> {
  return repoSearch(q);
}

// ================= Admin (CRUD + paginação) =================
// Admin continua batendo direto na API.
export const productService = {
  async list(q: ProductQuery): Promise<PagedResult<Product>> {
    if (API_BASE) {
      const params = new URLSearchParams();
      if (q.search) params.set("search", q.search);
      if (q.page) params.set("page", String(q.page));
      if (q.pageSize) params.set("pageSize", String(q.pageSize));
      if (q.categoryId) params.set("categoryId", q.categoryId);
      if (q.status && q.status !== "all") params.set("status", q.status);
      if (q.sort) params.set("sort", q.sort);
      return http<PagedResult<Product>>(`/api/admin/products?${params.toString()}`);
    }

    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 10;

    let data: Product[] = loadMem();
    if (!data.length) data = await repoListAll();

    if (q.search) {
      const k = q.search.toLowerCase();
      data = data.filter(
        (p: any) =>
          p.name.toLowerCase().includes(k) ||
          String(p.categoryName ?? p.categorySlug ?? "")
            .toLowerCase()
            .includes(k) ||
          (p.tags ?? []).some((t: string) => t.toLowerCase().includes(k)),
      );
    }
    if (q.status && q.status !== "all") {
      data = data.filter((p: any) => (p.status ?? "published") === q.status);
    }

    if (q.sort) {
      const map: Record<string, (a: any, b: any) => number> = {
        name_asc: (a, b) => a.name.localeCompare(b.name),
        name_desc: (a, b) => b.name.localeCompare(a.name),
        price_asc: (a, b) => Number(a.price ?? 0) - Number(b.price ?? 0),
        price_desc: (a, b) => Number(b.price ?? 0) - Number(a.price ?? 0),
        created_desc: (a, b) =>
          String(b.updatedAt || b.createdAt || "").localeCompare(
            String(a.updatedAt || a.createdAt || ""),
          ),
      };
      data = [...data].sort(map[q.sort] ?? (() => 0));
    }

    const total = data.length;
    const start = (page - 1) * pageSize;
    const pageData = data.slice(start, start + pageSize);
    return { data: pageData, total, page, pageSize };
  },

  async create(payload: ProductCreate): Promise<Product> {
    if (API_BASE) {
      return http<Product>(`/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    const list = loadMem();
    const now = new Date().toISOString();
    const p: Product = {
      ...(payload as any),
      id: genIdNumber(),
      createdAt: now,
      updatedAt: now,
      stockQty:
        (payload as any).stockQty ?? ((payload as any).inStock ? 10 : 0),
      status:
        (payload as any).status ?? ((payload as any).inStock ? "published" : "draft"),
    };
    list.unshift(p);
    saveMem(list);
    return p;
  },

  async update(id: number, patch: ProductUpdate): Promise<Product> {
    if (API_BASE) {
      return http<Product>(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    }
    const list = loadMem();
    const idx = list.findIndex((p: any) => p.id === id);
    if (idx < 0) throw new Error("Produto não encontrado");
    const now = new Date().toISOString();
    list[idx] = { ...(list[idx] as any), ...patch, updatedAt: now };
    saveMem(list);
    return list[idx];
  },

  async remove(id: number): Promise<void> {
    if (API_BASE) {
      await http<void>(`/api/admin/products/${id}`, { method: "DELETE" });
      return;
    }
    const list = loadMem().filter((p: any) => p.id !== id);
    saveMem(list);
  },

  async duplicate(id: number): Promise<Product> {
    if (API_BASE) {
      return http<Product>(`/api/admin/products/${id}/duplicate`, {
        method: "POST",
      });
    }
    const list = loadMem();
    const src = list.find((p: any) => p.id === id);
    if (!src) throw new Error("Produto não encontrado");
    const now = new Date().toISOString();
    const copy: Product = {
      ...(src as any),
      id: genIdNumber(),
      name: `${(src as any).name} (cópia)`,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(copy);
    saveMem(list);
    return copy;
  },

  async uploadImages(files: File[]): Promise<string[]> {
    if (API_BASE) {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await fetch(`${API_BASE}/api/admin/uploads`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Falha ao fazer upload");
      return (await res.json()) as string[];
    }
    return files.map((f) => URL.createObjectURL(f));
  },
};
