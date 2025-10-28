// src/States/order.admin.store.ts
import { create } from "zustand";
import {
  listAllOrders,
  getOrder,
  updateOrderStatus,
  addOrderNote,
  type Order,
  type OrderStatus,
} from "@repo/order.repository";

type State = {
  items: Order[];
  loading: boolean;
  error?: string;
  current?: Order | null;

  fetch: () => Promise<void>;
  open: (id: string | number) => Promise<void>;
  close: () => void;
  setStatus: (id: string | number, status: OrderStatus, note?: string) => Promise<void>;
  addNote: (id: string | number, note: string) => Promise<void>;
};

export const useAdminOrders = create<State>((set) => ({
  items: [],
  loading: false,
  current: null,

  async fetch() {
    set({ loading: true, error: undefined });
    try {
      const data = await listAllOrders();
      set({ items: data, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Erro ao carregar pedidos" });
    }
  },

  async open(id) {
    set({ loading: true, error: undefined });
    try {
      const row = await getOrder(String(id));
      set({ current: row ?? null, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Erro ao abrir pedido" });
    }
  },

  close() {
    set({ current: null });
  },

  async setStatus(id, status, note) {
    try {
      const next = await updateOrderStatus(String(id), status, note);
      const data = await listAllOrders();
      set({ items: data, current: next });
    } catch (e: any) {
      set({ error: e?.message || "Falha ao atualizar status" });
    }
  },

  async addNote(id, note) {
    try {
      const next = await addOrderNote(String(id), note);
      const data = await listAllOrders();
      set({ items: data, current: next });
    } catch (e: any) {
      set({ error: e?.message || "Falha ao adicionar nota" });
    }
  },
}));
