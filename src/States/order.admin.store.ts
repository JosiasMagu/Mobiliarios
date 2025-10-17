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
  open: (id: string) => Promise<void>;
  close: () => void;
  setStatus: (id: string, status: OrderStatus, note?: string) => Promise<void>;
  addNote: (id: string, note: string) => Promise<void>;
};

export const useAdminOrders = create<State>((set) => ({
  items: [],
  loading: false,
  current: null,

  async fetch() {
    set({ loading: true, error: undefined });
    try {
      const data = listAllOrders(); // já retorna em memória
      set({ items: data, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || "Erro ao carregar pedidos" });
    }
  },

  async open(id) {
    const row = getOrder(String(id));
    set({ current: row ?? null });
  },

  close() {
    set({ current: null });
  },

  async setStatus(id, status, note) {
    try {
      const next = updateOrderStatus(String(id), status, note);
      const data = listAllOrders();
      set({ items: data, current: next });
    } catch (e: any) {
      set({ error: e?.message || "Falha ao atualizar status" });
    }
  },

  async addNote(id, note) {
    try {
      const next = addOrderNote(String(id), note);
      const data = listAllOrders();
      set({ items: data, current: next });
    } catch (e: any) {
      set({ error: e?.message || "Falha ao adicionar nota" });
    }
  },
}));
