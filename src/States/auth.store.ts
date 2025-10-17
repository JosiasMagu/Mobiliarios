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

const LS_KEY = "app_auth_v1";

function loadFromStorage(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw);
    return { user: parsed?.user ?? null, token: parsed?.token ?? null };
  } catch {
    return { user: null, token: null };
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadFromStorage().user,
  token: loadFromStorage().token,

  async signIn(email, name) {
    const profile = await getOrCreateProfile(email.trim(), name);
    const token = "mock-" + Date.now();
    const user: User = { id: profile.id, name: profile.name, email: profile.email };
    set({ user, token });
    localStorage.setItem(LS_KEY, JSON.stringify({ user, token }));
  },

  signOut() {
    set({ user: null, token: null });
    localStorage.removeItem(LS_KEY);
  },

  async updateProfile(p) {
    const cur = get().user;
    if (!cur) return;
    const next: User = { ...cur, ...p };
    await saveProfile(next);
    set({ user: next });
    localStorage.setItem(LS_KEY, JSON.stringify({ user: next, token: get().token }));
  },
}));
