import { httpGet, httpPost, httpPatch, httpDelete } from "@/Utils/api";

export type Profile = { id: number | string; name: string; email: string };
export type AddressRepo = {
  id?: number | string;
  street: string;   // ex: "Bairro — Referência"
  city: string;     // cidade
  state: string;    // província
  zip?: string;     // opcional
  createdAt?: string;
};
export type Prefs = { marketing?: boolean };

export async function getProfile(): Promise<Profile> {
  // tenta /api/account/me, se não houver, usa /api/auth/me
  try { return await httpGet<Profile>("/api/account/me"); }
  catch { return await httpGet<Profile>("/api/auth/me"); }
}
export async function updateProfileReq(p: Partial<Profile>): Promise<Profile> {
  // fallback para /api/auth/profile se /api/account/profile não existir
  try { return await httpPatch<Profile>("/api/account/profile", p); }
  catch { return await httpPatch<Profile>("/api/auth/profile", p); }
}

export async function listAddresses(): Promise<AddressRepo[]> {
  return await httpGet<AddressRepo[]>("/api/account/addresses");
}
export async function createAddress(a: Omit<AddressRepo,"id"|"createdAt">): Promise<AddressRepo> {
  return await httpPost<AddressRepo>("/api/account/addresses", a);
}
export async function deleteAddress(id: number | string): Promise<void> {
  await httpDelete<void>(`/api/account/addresses/${id}`);
}

export async function listMyOrders(): Promise<any[]> {
  // implementado no backend como /api/orders/mine
  // se não existir, mapeia para /api/orders?mine=1
  try { return await httpGet<any[]>("/api/orders/mine"); }
  catch { return await httpGet<any[]>("/api/orders?mine=1"); }
}

export async function getPrefs(): Promise<Prefs> {
  try { return await httpGet<Prefs>("/api/account/prefs"); }
  catch { return { marketing: false }; }
}
export async function updatePrefsReq(p: Prefs): Promise<Prefs> {
  return await httpPatch<Prefs>("/api/account/prefs", p);
}
