import { getJSON, setJSON, removeItem } from "./storage.service";
import { STORAGE_KEYS } from "../Utils/config";

export type User = { id: string; name: string; email: string | null; password?: string };

const CLIENT_AUTH_KEY = "client_auth_v1";

function readCurrentUser(): User | null {
  const client = getJSON<{ token?: string | null; user?: User | null }>(CLIENT_AUTH_KEY, {} as any);
  if (client && client.user) return client.user as User;
  const legacy = getJSON<User | null>(STORAGE_KEYS.AUTH, null);
  return legacy ?? null;
}

function loadUsers(): User[] { return getJSON<User[]>(STORAGE_KEYS.USERS, []); }
function saveUsers(list: User[]) { setJSON(STORAGE_KEYS.USERS, list); }

function writeCurrentUser(u: User | null) {
  if (u) {
    setJSON(STORAGE_KEYS.AUTH, u);
    setJSON(CLIENT_AUTH_KEY, { token: "cli-" + Date.now(), user: u });
  } else {
    removeItem(STORAGE_KEYS.AUTH);
    removeItem(CLIENT_AUTH_KEY);
  }
}

export const AuthService = {
  me(): User | null {
    return readCurrentUser();
  },

  login(email: string, password: string): User {
    const u = loadUsers().find(x => x.email === email && x.password === password);
    if (!u) throw new Error("Credenciais inválidas");
    const { password: _p, ...safe } = u;
    writeCurrentUser(safe as User);
    return safe as User;
  },

  register(name: string, email: string, password: string): User {
    const users = loadUsers();
    if (users.some(u => u.email === email)) throw new Error("Email já cadastrado");
    const u: User = { id: crypto.randomUUID(), name, email, password };
    users.push(u); saveUsers(users);
    const { password: _p, ...safe } = u;
    writeCurrentUser(safe as User);
    return safe as User;
  },

  update(next: User) {
    writeCurrentUser(next);
    const list = loadUsers();
    const i = list.findIndex(x => x.id === next.id);
    if (i >= 0) {
      list[i] = { ...list[i], ...next };
      saveUsers(list);
    }
  },

  logout() { writeCurrentUser(null); },
};
