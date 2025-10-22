import { useEffect, useState } from "react";
import { AuthService } from "../../Services/auth.service";
import type { User } from "../../Services/auth.service";
import { listMyOrders } from "../../Repository/order.repository";
import {
  listAddresses,
  upsertAddress,
  deleteAddress,
  getPrefs,
  savePrefs,
} from "../../Repository/customer.repository";

const CLIENT_AUTH_KEY = "client_auth_v1";
const LEGACY_USER_KEY = "auth_user";

function readClientUser(): User | null {
  try {
    const raw = localStorage.getItem(CLIENT_AUTH_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { token?: string | null; user?: User | null };
    return (v?.user as User) ?? null;
  } catch { return null; }
}

function writeSession(u: User | null) {
  try {
    if (u) {
      localStorage.setItem(CLIENT_AUTH_KEY, JSON.stringify({ token: "cli-" + Date.now(), user: u }));
      localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(CLIENT_AUTH_KEY);
      localStorage.removeItem(LEGACY_USER_KEY);
    }
  } catch {}
}

export function useAccountController() {
  const initialUser = (() => {
    try { return AuthService?.me?.() ?? null; } catch { return readClientUser(); }
  })();

  const [user, setUser] = useState<User | null>(initialUser);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [prefs, setPrefs] = useState<{ marketing: boolean }>({ marketing: false });
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      let me: User | null = null;
      try { me = AuthService?.me?.() ?? null; } catch { me = null; }
      if (!me) me = readClientUser();
      setUser(me);

      const key = (me?.email ?? "") || (me as any)?.id || "";
      if (key) {
        const ord = await listMyOrders(key);
        setOrders(ord);

        if (me?.email) {
          const [addr, pf] = await Promise.all([
            listAddresses(me.email).catch(() => []),
            getPrefs(me.email).catch(() => ({ marketing: false })),
          ]);
          setAddresses(addr);
          setPrefs(pf);
        } else {
          setAddresses([]);
          setPrefs({ marketing: false });
        }
      } else {
        setOrders([]);
        setAddresses([]);
        setPrefs({ marketing: false });
      }
    } finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  async function signIn(payload: Partial<User> & { email?: string | null }) {
    const next: User = {
      id: String(Date.now()),
      name: payload.name ?? "Convidado",
      email: payload.email ?? null,
    };
    writeSession(next);
    try {
      const anyAuth = AuthService as any;
      if (typeof anyAuth.update === "function") await anyAuth.update(next);
    } catch {}
    setUser(next);
    await refresh();
  }

  function signOut() { logout(); }

  function logout() {
    try {
      const anyAuth = AuthService as any;
      if (typeof anyAuth.logout === "function") anyAuth.logout();
    } catch {}
    writeSession(null);
    setUser(null);
    setOrders([]);
    setAddresses([]);
    setPrefs({ marketing: false });
  }

  async function updateProfile(p: Partial<User>) {
    const me = user ?? readClientUser() ?? null;
    if (!me) return;
    const next: User = { ...me, ...p };
    try {
      const anyAuth = AuthService as any;
      if (typeof anyAuth.update === "function") await anyAuth.update(next);
      else writeSession(next);
    } catch { writeSession(next); }
    setUser(next);
  }

  async function saveAddressHandler(a: any) {
    if (!user?.email) return;
    const next = await upsertAddress(user.email, a);
    setAddresses(next);
  }
  async function removeAddressHandler(id: string) {
    if (!user?.email) return;
    const next = await deleteAddress(user.email, id);
    setAddresses(next);
  }
  async function updatePrefsHandler(p: { marketing: boolean }) {
    if (!user?.email) return;
    const next = await savePrefs(user.email, p);
    setPrefs(next);
  }

  return {
    user,
    orders,
    addresses,
    prefs,
    loading,
    signIn,
    signOut,
    updateProfile,
    logout,
    refresh,
    saveAddress: saveAddressHandler,
    removeAddress: removeAddressHandler,
    updatePrefs: updatePrefsHandler,
  };
}
