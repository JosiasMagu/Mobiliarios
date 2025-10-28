// state/auth.store.ts
import { httpPost } from "@/Utils/api";

export type Role = "ADMIN" | "GERENTE" | "CLIENTE";
export type User = { id: number; name: string; email: string; role: Role };

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (t: string, u: User) => void;
  clear: () => void;
  onChange: (fn: () => void) => () => void;
};

const LS = "mobiliario:auth_v1";
let listeners: Array<() => void> = [];

function emit() { listeners.forEach(fn => fn()); }
function load(): { token: string|null; user: User|null } {
  try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch { return { token:null, user:null }; }
}

export const auth: AuthState = {
  token: load().token ?? null,
  user: load().user ?? null,
  setAuth(t, u) { this.token = t; this.user = u; localStorage.setItem(LS, JSON.stringify({ token:t, user:u })); emit(); },
  clear() { this.token = null; this.user = null; localStorage.removeItem(LS); emit(); },
  onChange(fn) { listeners.push(fn); return () => { listeners = listeners.filter(f => f!==fn); }; }
};

export function useAdminAuth() {
  const isAdmin = () => !!auth.token && auth.user?.role === "ADMIN";
  const authHeader = () => (auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined);

  async function signIn(email: string, password: string) {
    const { token, user } = await httpPost<{token:string; user:User}>("/api/auth/login", { email, password });
    auth.setAuth(token, user);
    return true;
  }
  function signOut() { auth.clear(); }

  return { token: auth.token, user: auth.user, isAdmin, authHeader, signIn, signOut, subscribe: auth.onChange };
}

// SHIM legado para código que importa useAuthStore de @state/auth.store
export function useAuthStore() {
  return {
    token: auth.token,
    user: auth.user,
    isLogged: () => !!auth.token,
    isAdmin: () => auth.user?.role === "ADMIN",
    signOut: () => auth.clear(),
  };
}
