// src/Controllers/Loja/account.controller.ts
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

export function useAccountController() {
  const [user, setUser] = useState<User | null>(AuthService.me());
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [prefs, setPrefs] = useState<{ marketing: boolean }>({ marketing: false });
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const me = AuthService.me();
      setUser(me);

      const key = me?.email || (me as any)?.id || "";
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  /** Compat: usado pelo UI para autenticar. */
  async function signIn(payload: Partial<User> & { email?: string }) {
    const anyAuth = AuthService as any;
    let next: User;

    if (typeof anyAuth.login === "function") {
      // se seu AuthService tiver login, use-o
      next = await anyAuth.login(payload);
    } else {
      // fallback mínimo: persiste no localStorage
      next = {
        id: String(Date.now()),
        name: payload.name ?? "Convidado",
        email: payload.email,
      } as User;
      try {
        localStorage.setItem("auth_user", JSON.stringify(next));
      } catch {}
      if (typeof anyAuth.me === "function") {
        // se seu AuthService ler do localStorage, manter compat
      }
    }

    setUser(next);
    await refresh();
  }

  function signOut() {
    logout();
  }

  function logout() {
    const anyAuth = AuthService as any;
    if (typeof anyAuth.logout === "function") anyAuth.logout();
    try {
      localStorage.removeItem("auth_user");
    } catch {}
    setUser(null);
    setOrders([]);
    setAddresses([]);
    setPrefs({ marketing: false });
  }

  /** Atualiza nome/email no perfil atual. */
  async function updateProfile(p: Partial<User>) {
    const me = AuthService.me();
    if (!me) return;
    const next = { ...me, ...p } as User;

    const anyAuth = AuthService as any;
    if (typeof anyAuth.update === "function") {
      await anyAuth.update(next);
    } else {
      try {
        localStorage.setItem("auth_user", JSON.stringify(next));
      } catch {}
    }
    setUser(next);
  }

  // Endereços e preferências
  async function saveAddress(a: any) {
    if (!user?.email) return;
    const next = await upsertAddress(user.email, a);
    setAddresses(next);
  }
  async function removeAddress(id: string) {
    if (!user?.email) return;
    const next = await deleteAddress(user.email, id);
    setAddresses(next);
  }
  async function updatePrefs(p: { marketing: boolean }) {
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
    // expostos para AccountPage
    signIn,
    signOut,
    updateProfile,
    // utilidades
    logout,
    refresh,
    saveAddress,
    removeAddress,
    updatePrefs,
  };
}
