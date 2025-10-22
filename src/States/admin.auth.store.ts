// src/States/admin.auth.store.ts
import { create } from "zustand";

type Role = "ADMIN" | "GERENTE" | "CLIENTE";
type AdminUser = { id: number; name: string; email: string; role: Role };

type AdminAuthState = {
  token: string | null;
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  authHeader: () => Record<string, string>;
  isAdmin: () => boolean;
};

const BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8080";

const LS_KEY = "admin_auth_v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return { token: null, user: null };
  }
}

export const useAdminAuth = create<AdminAuthState>((set, get) => ({
  token: load().token ?? null,
  user: load().user ?? null,
  loading: false,
  error: null,

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          msg = j?.error || j?.message || msg;
        } catch {}
        throw new Error(msg);
      }
      const data = (await res.json()) as { token: string; user: AdminUser };
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ token: data.token, user: data.user })
      );
      set({ token: data.token, user: data.user, loading: false });
      return true;
    } catch (e: any) {
      set({ error: e?.message || "Erro ao autenticar", loading: false });
      return false;
    }
  },

  logout() {
    localStorage.removeItem(LS_KEY);
    set({ token: null, user: null });
  },

  authHeader() {
    const t = get().token;
    const headers: Record<string, string> = {};
    if (t) headers.Authorization = `Bearer ${t}`;
    return headers;
  },

  isAdmin() {
    return !!get().token && get().user?.role === "ADMIN";
  },
}));
