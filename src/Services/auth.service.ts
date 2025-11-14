import { httpGet, httpPost } from "@/Utils/api";

export type User = { id: string | number; name: string; email: string };

const STORE_KEY = "mobiliario:auth_v1";
const ADMIN_STORE_KEY = "admin_auth_v1";
const CLIENT_AUTH_KEY = "client_auth_v1";

function writeSession(user: User | null, token?: string | null) {
  if (user && token) {
    const payload = { token, user };
    localStorage.setItem(STORE_KEY, JSON.stringify(payload));
    localStorage.setItem(ADMIN_STORE_KEY, JSON.stringify(payload));
    localStorage.setItem(CLIENT_AUTH_KEY, JSON.stringify(payload));
  } else {
    [STORE_KEY, ADMIN_STORE_KEY, CLIENT_AUTH_KEY].forEach((k) => localStorage.removeItem(k));
  }
}
function readToken(): string | null {
  try {
    for (const k of [STORE_KEY, ADMIN_STORE_KEY, CLIENT_AUTH_KEY]) {
      const v = JSON.parse(localStorage.getItem(k) || "null");
      if (v?.token) return v.token as string;
    }
  } catch {}
  return null;
}
function readUser(): User | null {
  try {
    for (const k of [STORE_KEY, ADMIN_STORE_KEY, CLIENT_AUTH_KEY]) {
      const v = JSON.parse(localStorage.getItem(k) || "null");
      if (v?.user) return v.user as User;
    }
  } catch {}
  return null;
}

export const AuthService = {
  token(): string | null {
    return readToken();
  },
  me(): User | null {
    return readUser();
  },

  async refreshMe(): Promise<User | null> {
    const t = readToken();
    if (!t) return null;
    const user = await httpGet<User>("/api/auth/me", t);
    writeSession(user, t);
    return user;
  },

  // tenta /signup, se não existir cai em /register
  async register(name: string, email: string, password: string): Promise<User> {
    try {
      const r1 = await httpPost<{ token: string; user: User }>("/api/auth/signup", {
        name,
        email,
        password,
      });
      writeSession(r1.user, r1.token);
      return r1.user;
    } catch {
      const r2 = await httpPost<{ token: string; user: User }>("/api/auth/register", {
        name,
        email,
        password,
      });
      writeSession(r2.user, r2.token);
      return r2.user;
    }
  },

  async login(email: string, password: string): Promise<User> {
    const { token, user } = await httpPost<{ token: string; user: User }>("/api/auth/login", {
      email,
      password,
    });
    writeSession(user, token);
    return user;
  },

  async update(next: Partial<User>): Promise<User> {
    const me = readUser();
    if (!me) throw new Error("not_authenticated");
    const merged = { ...me, ...next } as User;
    // troca por PATCH /api/auth/profile quando existir
    writeSession(merged, readToken());
    return merged;
  },

  logout() {
    writeSession(null);
  },
};
