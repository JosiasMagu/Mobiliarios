// src/Services/auth.service.ts
import { getJSON, setJSON, removeItem } from "./storage.service";
import { STORAGE_KEYS } from "../Utils/config";

export type User = { id: string; name: string; email: string | null; password?: string };

const CLIENT_AUTH_KEY = "client_auth_v1";
const ADMIN_STORE_KEY = "admin_auth_v1";
const STORE_KEY = "mobiliario:auth_v1"; // principal

function readStoreSession(): { token?: string|null; user?: User|null } | null {
  try {
    const a = getJSON<{ token?: string|null; user?: User|null }>(STORE_KEY as any, null as any);
    if (a?.token || a?.user) return a;
  } catch {}
  try {
    const b = getJSON<{ token?: string|null; user?: User|null }>(ADMIN_STORE_KEY as any, null as any);
    if (b?.token || b?.user) return b;
  } catch {}
  try {
    const c = getJSON<{ token?: string|null; user?: User|null }>(CLIENT_AUTH_KEY as any, null as any);
    if (c?.token || c?.user) return c;
  } catch {}
  return null;
}

function readCurrentUser(): User | null {
  const client = getJSON<{ token?: string | null; user?: User | null }>(CLIENT_AUTH_KEY, {} as any);
  if (client && client.user) return client.user as User;
  const legacy = getJSON<User | null>(STORAGE_KEYS.AUTH, null);
  return legacy ?? null;
}

function loadUsers(): User[] { return getJSON<User[]>(STORAGE_KEYS.USERS, []); }
function saveUsers(list: User[]) { setJSON(STORAGE_KEYS.USERS, list); }

/** Grava/limpa sessão em TODAS as stores compatíveis. */
function writeSession(u: User | null, token?: string | null) {
  if (u) {
    const payload = { token: token ?? ("cli-" + Date.now()), user: u };
    setJSON(STORE_KEY as any, payload);
    setJSON(ADMIN_STORE_KEY as any, payload);
    setJSON(CLIENT_AUTH_KEY as any, payload);
    setJSON(STORAGE_KEYS.AUTH, u); // legado
  } else {
    removeItem(STORE_KEY as any);
    removeItem(ADMIN_STORE_KEY as any);
    removeItem(CLIENT_AUTH_KEY as any);
    removeItem(STORAGE_KEYS.AUTH);
  }
}

export const AuthService = {
  /** Novo: devolve apenas o token atual ou null. */
  token(): string | null {
    const s = readStoreSession();
    return (s?.token ?? null) as any;
  },

  /** Sessão unificada. */
  session(): { token: string | null; user: User | null } {
    const s = readStoreSession();
    return { token: (s?.token ?? null) as any, user: (s?.user ?? null) as any };
  },

  me(): User | null {
    const s = readStoreSession();
    if (s?.user) return s.user as User;
    return readCurrentUser();
  },

  login(email: string, password: string): User {
    const u = loadUsers().find(x => x.email === email && x.password === password);
    if (!u) throw new Error("Credenciais inválidas");
    const { password: _p, ...safe } = u;
    writeSession(safe as User, "cli-" + Date.now());
    return safe as User;
  },

  register(name: string, email: string, password: string): User {
    const users = loadUsers();
    if (users.some(u => u.email === email)) throw new Error("Email já cadastrado");
    const u: User = { id: crypto.randomUUID(), name, email, password };
    users.push(u); saveUsers(users);
    const { password: _p, ...safe } = u;
    writeSession(safe as User, "cli-" + Date.now());
    return safe as User;
  },

  update(next: User) {
    // atualiza lista local
    const list = loadUsers();
    const i = list.findIndex(x => x.id === next.id);
    if (i >= 0) {
      list[i] = { ...list[i], ...next };
      saveUsers(list);
    }
    // preserva token atual e grava usuário nas stores
    const cur = readStoreSession();
    writeSession(next, cur?.token ?? null);
  },

  logout() { writeSession(null); },
};
