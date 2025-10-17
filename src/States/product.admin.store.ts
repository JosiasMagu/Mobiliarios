import { create } from "zustand";
import type { Product, ProductQuery, PagedResult } from "@/Model/product.model";
import { productService } from "@/Services/product.service";

type DialogState = {
  open: boolean;
  editing?: Product | null;
};

type State = {
  list: Product[];
  total: number;
  query: ProductQuery;
  loading: boolean;
  dialog: DialogState;
  error?: string | null;
};

type Actions = {
  fetch: (partial?: Partial<ProductQuery>) => Promise<void>;
  add: (payload: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  update: (id: number, payload: Partial<Product>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  duplicate: (id: number) => Promise<void>;
  setSearch: (s: string) => void;
  setPage: (p: number) => void;
  openCreate: () => void;
  openEdit: (p: Product) => void;
  closeDialog: () => void;
};

const initialQuery: ProductQuery = {
  page: 1,
  pageSize: 10,
  status: "all",
  sort: "created_desc",
};

export const useAdminProducts = create<State & Actions>((set, get) => ({
  list: [],
  total: 0,
  loading: false,
  query: initialQuery,
  dialog: { open: false, editing: null },
  error: null,

  async fetch(partial) {
    const nextQ = { ...get().query, ...partial };
    set({ loading: true, error: null, query: nextQ });
    try {
      const res: PagedResult<Product> = await productService.list(nextQ);
      set({ list: res.data, total: res.total, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Erro ao carregar produtos" });
    }
  },

  async add(payload) {
    set({ loading: true, error: null });
    try {
      await productService.create(payload);
      set({ dialog: { open: false, editing: null } });
      await get().fetch();
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Erro ao criar" });
    }
  },

  async update(id, payload) {
    set({ loading: true, error: null });
    try {
      await productService.update(id, payload);
      set({ dialog: { open: false, editing: null } });
      await get().fetch();
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Erro ao atualizar" });
    }
  },

  async remove(id) {
    set({ loading: true, error: null });
    try {
      await productService.remove(id);
      await get().fetch();
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Erro ao excluir" });
    }
  },

  async duplicate(id) {
    set({ loading: true, error: null });
    try {
      await productService.duplicate(id);
      await get().fetch();
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Erro ao duplicar" });
    }
  },

  setSearch(s) {
    set({ query: { ...get().query, search: s, page: 1 } });
  },
  setPage(p) {
    set({ query: { ...get().query, page: p } });
  },

  openCreate() {
    set({ dialog: { open: true, editing: null } });
  },
  openEdit(p) {
    set({ dialog: { open: true, editing: p } });
  },
  closeDialog() {
    set({ dialog: { open: false, editing: null } });
  },
}));
