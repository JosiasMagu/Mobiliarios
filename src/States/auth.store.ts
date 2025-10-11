// src/States/auth.store.ts
import { create } from "zustand";
import { getOrCreateProfile, saveProfile } from "@repo/customer.repository";

export type User = { id: string; name: string; email: string };

type AuthState = {
  user: User | null;
  token: string | null;
  signIn: (email: string, name?: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (p: Partial<User>) => Promise<void>;
};

// hidratar de localStorage
const LS_KEY = "app_auth_v1";
const load = (): Pick<AuthState, "user" | "token"> => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return { user: null, token: null }; }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: load().user ?? null,
  token: load().token ?? null,

  async signIn(email, name) {
    const profile = await getOrCreateProfile(email.trim(), name);
    const token = "mock-" + Date.now();
    set({ user: { id: profile.id, name: profile.name, email: profile.email }, token });
    localStorage.setItem(LS_KEY, JSON.stringify({ user: get().user, token }));
  },

  signOut() {
    set({ user: null, token: null });
    localStorage.removeItem(LS_KEY);
  },

  async updateProfile(p) {
    const cur = get().user;
    if (!cur) return;
    const next = { ...cur, ...p };
    await saveProfile(next);
    set({ user: next });
    localStorage.setItem(LS_KEY, JSON.stringify({ user: next, token: get().token }));
  },
}));
