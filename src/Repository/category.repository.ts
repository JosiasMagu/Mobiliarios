// src/Repository/category.repository.ts
import raw from "../Data/categories.mock.json";

/** ===== Tipos ===== */
export type Category = {
  id: string;                // mantém compat com teu mock
  name: string;
  slug: string;
  image?: string;
  icon?: string;             // novo: ícone opcional
  parentId?: string | null;  // novo: subcategoria
  position: number;          // novo: ordenação
  isActive: boolean;         // novo: status
  createdAt: string;
  updatedAt: string;
  [k: string]: any;
};

export type CategoryUpsertInput = Partial<Pick<Category,
  "id" | "slug" | "image" | "icon" | "parentId" | "position" | "isActive"
>> & {
  name: string;
};

export type ReorderPair = { id: string; position: number };

/** ===== Util ===== */
const KEY = "admin.categories.v1";

function slugify(s: string) {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function nowISO() { return new Date().toISOString(); }

function normalizeSeed(x: any, idx: number): Category {
  const n = String(x?.name ?? `Categoria ${idx + 1}`);
  const t = nowISO();
  return {
    id: String(x?.id ?? (idx + 1)),
    name: n,
    slug: String(x?.slug ?? slugify(n)),
    image: x?.image ?? undefined,
    icon: x?.icon ?? undefined,
    parentId: x?.parentId != null ? String(x.parentId) : null,
    position: Number.isFinite(x?.position) ? Number(x.position) : idx + 1,
    isActive: x?.isActive != null ? Boolean(x.isActive) : true,
    createdAt: String(x?.createdAt ?? t),
    updatedAt: String(x?.updatedAt ?? t),
  };
}

/** ===== Persistência ===== */
function load(): Category[] {
  try {
    const cached = localStorage.getItem(KEY);
    if (cached) return JSON.parse(cached) as Category[];
  } catch { /* ignore */ }

  // seed a partir do JSON existente
  const seeded = (raw as any[]).map(normalizeSeed);
  try { localStorage.setItem(KEY, JSON.stringify(seeded)); } catch { /* ignore */ }
  return seeded;
}

function save(all: Category[]) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

/** ===== API ===== */
export async function listCategories(): Promise<Category[]> {
  const all = load();
  return all
    .slice()
    .sort((a, b) =>
      (a.position - b.position) || a.name.localeCompare(b.name));
}

export async function getCategory(id: string): Promise<Category | null> {
  const all = load();
  return all.find(c => c.id === String(id)) ?? null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const all = load();
  return all.find(c => c.slug === String(slug));
}

export async function upsertCategory(input: CategoryUpsertInput): Promise<Category> {
  const all = load();
  const t = nowISO();

  // update
  if (input.id) {
    const idx = all.findIndex(c => c.id === String(input.id));
    if (idx === -1) throw new Error("Categoria não encontrada");
    const curr = all[idx];

    const name = input.name ?? curr.name;
    const next: Category = {
      ...curr,
      ...input,
      name,
      slug: slugify(input.slug || name),
      parentId: input.parentId != null ? (input.parentId === "" ? null : String(input.parentId)) : curr.parentId,
      position: Number.isFinite(input.position) ? Number(input.position) : curr.position,
      isActive: input.isActive != null ? Boolean(input.isActive) : curr.isActive,
      updatedAt: t,
    };

    all[idx] = next;
    save(all);
    return next;
  }

  // create
  const name = input.name.trim();
  const newId = (() => {
    const max = all.reduce((m, c) => Math.max(m, Number(c.id) || 0), 0);
    return String(max + 1);
  })();

  const row: Category = {
    id: newId,
    name,
    slug: slugify(input.slug || name),
    image: input.image,
    icon: input.icon,
    parentId: input.parentId != null ? (input.parentId === "" ? null : String(input.parentId)) : null,
    position: Number.isFinite(input.position) ? Number(input.position) : (all.length + 1),
    isActive: input.isActive != null ? Boolean(input.isActive) : true,
    createdAt: t,
    updatedAt: t,
  };

  all.push(row);
  save(all);
  return row;
}

export async function deleteCategory(id: string): Promise<void> {
  const all = load();
  const sid = String(id);
  const filtered = all.filter(c => c.id !== sid && c.parentId !== sid); // remove filhos também
  save(filtered);
}

export async function reorderCategories(pairs: ReorderPair[]): Promise<void> {
  const all = load();
  const map = new Map(pairs.map(p => [String(p.id), Number(p.position)]));
  all.forEach(c => {
    const p = map.get(c.id);
    if (typeof p === "number" && Number.isFinite(p)) c.position = p;
  });
  save(all);
}

/** Helpers convenientes */
export async function createCategory(input: Omit<CategoryUpsertInput, "id">) {
  return upsertCategory(input);
}
export async function updateCategory(id: string, input: Omit<CategoryUpsertInput, "id">) {
  return upsertCategory({ ...input, id });
}
