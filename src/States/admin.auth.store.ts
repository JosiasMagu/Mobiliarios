// Autenticação simples do Admin (persistida)
import { create } from "zustand";

type AdminState = {
  token: string | null;
  name: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
};

const LS_KEY = "admin_auth_v1";

const load = (): Pick<AdminState, "token" | "name"> => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return { token: null, name: null };
  }
};

export const useAdminAuth = create<AdminState>((set, get) => ({
  token: load().token ?? null,
  name: load().name ?? null,

  async signIn(email, password) {
    // mock: qualquer email + senha "admin123" entra
    const ok = password === "admin123";
    if (ok) {
      const token = "adm-" + Date.now();
      const name = email.split("@")[0] || "Administrador";
      set({ token, name });
      localStorage.setItem(LS_KEY, JSON.stringify({ token, name }));
    }
    return ok;
  },

  signOut() {
    set({ token: null, name: null });
    localStorage.removeItem(LS_KEY);
  },
}));
