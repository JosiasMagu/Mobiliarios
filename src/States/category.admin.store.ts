import { create } from "zustand";
import type { Category } from "@model/category.model";
import {
  listCategories,
  upsertCategory,
  deleteCategory,
  reorderCategories,
} from "@repo/category.repository";

type UpsertInput = Omit<Category, "createdAt" | "updatedAt" | "slug"> & { id?: string; slug?: string };

type State = {
  items: Category[];
  loading: boolean;
  error?: string;
  fetch: () => Promise<void>;
  createOrUpdate: (c: Partial<UpsertInput> & { name: string; id?: string }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (pairs: Array<{ id: string; position: number }>) => Promise<void>;
};

export const useAdminCategories = create<State>((set, get) => ({
  items: [],
  loading: false,

  async fetch() {
    set({ loading: true, error: undefined });
    try {
      const data = await listCategories();
      set({ items: data, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Erro" });
    }
  },

  async createOrUpdate(input) {
    set({ loading: true, error: undefined });
    try {
      await upsertCategory(input as any);
      await get().fetch();
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Erro" });
    }
  },

  async remove(id) {
    set({ loading: true, error: undefined });
    try {
      await deleteCategory(String(id));
      await get().fetch();
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Erro" });
    }
  },

  async reorder(pairs) {
    // garante id:string para o repositório
    const fixed = pairs.map(p => ({ id: String(p.id), position: Number(p.position) }));
    await reorderCategories(fixed);
    await get().fetch();
  },
}));
