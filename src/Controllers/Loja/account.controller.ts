// src/Controllers/Account/account.controller.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthService, type User } from "@/Services/auth.service";
import { listMyOrders } from "@/Repository/order.repository";
import {
  listAddresses,
  upsertAddress,
  deleteAddress,
  getPrefs,
  savePrefs,
} from "@/Repository/customer.repository";

/** tempo máximo para aguardar o backend antes de devolver um fallback local */
const DEFAULT_TIMEOUT_MS = 5000;

async function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  let t: ReturnType<typeof setTimeout> | null = null;
  try {
    const timeout = new Promise<T>((resolve) => {
      t = setTimeout(() => resolve(fallback), ms);
    });
    return await Promise.race([p, timeout]);
  } finally {
    if (t) clearTimeout(t);
  }
}

export function useAccountController() {
  // estado principal
  const [user, setUser] = useState<User | null>(AuthService.me());
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [prefs, setPrefs] = useState<{ marketing: boolean }>({ marketing: false });
  const [loading, setLoading] = useState(true);

  // controle de ciclo de vida
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  /** Bootstrap e recarregamento de dados do /account */
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // 1) garantir usuário atual a partir do token
      const me = await AuthService.refreshMe();
      if (alive.current) setUser(me);

      if (!me) {
        if (alive.current) {
          setOrders([]);
          setAddresses([]);
          setPrefs({ marketing: false });
        }
        return;
      }

      const token = AuthService.token() ?? undefined;
      const email = me.email;

      // 2) carregar blocos em paralelo, com timeouts seguros
      const [ordR, addrR, prefR] = await Promise.allSettled([
        withTimeout(listMyOrders(token), DEFAULT_TIMEOUT_MS, [] as any[]),
        withTimeout(listAddresses(email), DEFAULT_TIMEOUT_MS, [] as any[]),
        withTimeout(getPrefs(email), DEFAULT_TIMEOUT_MS, { marketing: false }),
      ]);

      if (!alive.current) return;

      if (ordR.status === "fulfilled") setOrders(ordR.value || []);
      if (addrR.status === "fulfilled") setAddresses(addrR.value || []);
      if (prefR.status === "fulfilled") setPrefs(prefR.value || { marketing: false });
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  // carregar ao montar
  useEffect(() => { void refresh(); }, [refresh]);

  /** Logout limpo */
  const signOut = useCallback(() => {
    AuthService.logout();
    if (!alive.current) return;
    setUser(null);
    setOrders([]);
    setAddresses([]);
    setPrefs({ marketing: false });
    setLoading(false);
  }, []);

  /** Atualiza perfil local e no storage; backend é opcional no teu serviço */
  const updateProfile = useCallback(async (p: Partial<User>) => {
    const next = await AuthService.update(p);
    if (alive.current) setUser(next);
  }, []);

  /** Cria/atualiza endereço e recarrega lista para refletir na UI */
  const saveAddressHandler = useCallback(async (a: any) => {
    if (!user?.email) return;
    await withTimeout(upsertAddress(user.email, a), DEFAULT_TIMEOUT_MS, null as any);
    // sempre recarrega a lista para consistência
    const list = await withTimeout(listAddresses(user.email), DEFAULT_TIMEOUT_MS, addresses);
    if (alive.current) setAddresses(list || []);
  }, [user, addresses]);

  /** Remove endereço por id e atualiza estado */
  const removeAddressHandler = useCallback(async (id: string | number) => {
    if (!user?.email) return;
    await withTimeout(deleteAddress(user.email, String(id)), DEFAULT_TIMEOUT_MS, null as any);
    const list = await withTimeout(listAddresses(user.email), DEFAULT_TIMEOUT_MS, addresses);
    if (alive.current) setAddresses(list || []);
  }, [user, addresses]);

  /** Atualiza preferências com otimista e confirma no backend */
  const updatePrefsHandler = useCallback(async (p: { marketing: boolean }) => {
    if (!user?.email) return;
    const prev = prefs;
    if (alive.current) setPrefs({ ...prev, ...p }); // otimista
    try {
      const saved = await withTimeout(savePrefs(user.email, { ...prev, ...p }), DEFAULT_TIMEOUT_MS, prev);
      if (alive.current) setPrefs(saved || prev);
    } catch {
      if (alive.current) setPrefs(prev); // rollback
    }
  }, [user, prefs]);

  return {
    // dados
    user,
    orders,
    addresses,
    prefs,
    loading,
    // comandos
    refresh,
    logout: signOut,
    updateProfile,
    saveAddress: saveAddressHandler,
    removeAddress: removeAddressHandler,
    updatePrefs: updatePrefsHandler,
  };
}
