import { getJSON, setJSON, removeItem } from "./storage.service";
import { STORAGE_KEYS } from "../Utils/config";

export type User = { id: string; name: string; email: string; password?: string };

function loadUsers(): User[] { return getJSON<User[]>(STORAGE_KEYS.USERS, []); }
function saveUsers(list: User[]) { setJSON(STORAGE_KEYS.USERS, list); }

export const AuthService = {
  me(): User | null {
    const token = getJSON<User | null>(STORAGE_KEYS.AUTH, null);
    return token;
  },
  login(email: string, password: string): User {
    const u = loadUsers().find(x => x.email === email && x.password === password);
    if (!u) throw new Error("Credenciais inválidas");
    const { password: _p, ...safe } = u;
    setJSON(STORAGE_KEYS.AUTH, safe);
    return safe as User;
  },
  register(name: string, email: string, password: string): User {
    const users = loadUsers();
    if (users.some(u => u.email === email)) throw new Error("Email já cadastrado");
    const u: User = { id: crypto.randomUUID(), name, email, password };
    users.push(u); saveUsers(users);
    const { password: _p, ...safe } = u;
    setJSON(STORAGE_KEYS.AUTH, safe);
    return safe as User;
  },
  logout() { removeItem(STORAGE_KEYS.AUTH); },
};
