import { useCallback, useEffect, useRef, useState } from "react";
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
const DEFAULT_TIMEOUT_MS = 3000;

/** Resolve em até `ms`. Se estourar, retorna `fallback`. */
async function withTimeout<T>(p: Promise<T>, ms = DEFAULT_TIMEOUT_MS, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    const timeoutPromise = new Promise<T>((resolve) => {
      timer = setTimeout(() => resolve(fallback), ms);
    });
    const result = await Promise.race<T>([p, timeoutPromise]);
    return result;
  } finally {
    if (timer !== null) {
      clearTimeout(timer);
    }
  }
}

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

  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  // evita refresh concorrente
  const refreshing = useRef(false);
  const lastUserSig = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    setLoading(true);
    try {
      let me: User | null = null;
      try { me = AuthService?.me?.() ?? null; } catch { me = null; }
      if (!me) me = readClientUser();

      const sig = me ? JSON.stringify({ id: (me as any).id, email: me.email, name: (me as any).name }) : "null";
      if (sig !== lastUserSig.current) {
        lastUserSig.current = sig;
        if (alive.current) setUser(me);
      }

      const key = (me?.email ?? "") || (me as any)?.id || "";
      if (!key) {
        if (alive.current) { setOrders([]); setAddresses([]); setPrefs({ marketing: false }); }
        return;
      }

      // chamadas com timeout e fallback
      const ord  = await withTimeout(listMyOrders(key), DEFAULT_TIMEOUT_MS, []);
      const addr = me?.email
        ? await withTimeout(listAddresses(me.email), DEFAULT_TIMEOUT_MS, [])
        : [];
      const pf   = me?.email
        ? await withTimeout(getPrefs(me.email), DEFAULT_TIMEOUT_MS, { marketing: false })
        : { marketing: false };

      if (alive.current) {
        setOrders(ord || []);
        setAddresses(addr || []);
        setPrefs(pf || { marketing: false });
      }
    } finally {
      refreshing.current = false;
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const signIn = useCallback(async (payload: Partial<User> & { email?: string | null }) => {
    const next: User = {
      id: String(Date.now()),
      name: (payload as any)?.name ?? "Convidado",
      email: payload.email ?? null,
    };
    writeSession(next);
    try {
      const anyAuth = AuthService as any;
      if (typeof anyAuth.update === "function") await anyAuth.update(next);
    } catch {}
    if (alive.current) setUser(next);
    void refresh();
    return true;
  }, [refresh]);

  const signOut = useCallback(() => {
    try {
      const anyAuth = AuthService as any;
      if (typeof anyAuth.logout === "function") anyAuth.logout();
    } catch {}
    writeSession(null);
    if (alive.current) {
      setUser(null);
      setOrders([]);
      setAddresses([]);
      setPrefs({ marketing: false });
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (p: Partial<User>) => {
    const me = user ?? readClientUser() ?? null;
    if (!me) return;
    const next: User = { ...me, ...p };
    try {
      const anyAuth = AuthService as any;
      if (typeof anyAuth.update === "function") await anyAuth.update(next);
      else writeSession(next);
    } catch { writeSession(next); }
    if (alive.current) {
      setUser(next);
      lastUserSig.current = JSON.stringify({ id: (next as any).id, email: next.email, name: (next as any).name });
    }
  }, [user]);

  const saveAddressHandler = useCallback(async (a: any) => {
    if (!user?.email) return;
    const next = await withTimeout(upsertAddress(user.email, a), DEFAULT_TIMEOUT_MS, addresses);
    if (alive.current && next) setAddresses(next);
  }, [user, addresses]);

  const removeAddressHandler = useCallback(async (id: string) => {
    if (!user?.email) return;
    const next = await withTimeout(deleteAddress(user.email, id), DEFAULT_TIMEOUT_MS, addresses);
    if (alive.current && next) setAddresses(next);
  }, [user, addresses]);

  const updatePrefsHandler = useCallback(async (p: { marketing: boolean }) => {
    if (!user?.email) return;
    const next = await withTimeout(savePrefs(user.email, p), DEFAULT_TIMEOUT_MS, prefs);
    if (alive.current && next) setPrefs(next);
  }, [user, prefs]);

  return {
    user,
    orders,
    addresses,
    prefs,
    loading,
    signIn,
    signOut,
    updateProfile,
    logout: signOut,
    refresh,
    saveAddress: saveAddressHandler,
    removeAddress: removeAddressHandler,
    updatePrefs: updatePrefsHandler,
  };
}
