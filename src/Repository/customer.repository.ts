// src/Repository/customer.repository.ts
import { httpGet, httpPost, httpDelete } from "@utils/api";

export type CustomerProfile = { id: string; name: string; email: string };
export type Address = { id: number | string; street: string; city: string; state: string; zip: string | null };
export type Prefs = { marketing: boolean };

// Perfis não são persistidos aqui; o front usa /api/auth/me.
// Mantemos as assinaturas para compatibilidade.
export async function getOrCreateProfile(email: string, name?: string): Promise<CustomerProfile> {
  const safeEmail = String(email || "").toLowerCase();
  return { id: safeEmail, name: name ?? safeEmail.split("@")[0], email: safeEmail };
}
export async function saveProfile(p: CustomerProfile) {
  return p;
}

/** Endereços do usuário autenticado (token no header via http helpers) */
export async function listAddresses(_email: string) {
  const list = await httpGet<Address[]>("/api/account/addresses");
  return Array.isArray(list) ? list : [];
}

/** Cria/atualiza endereço. Para edição por ID, ajustar backend com PATCH. */
export async function upsertAddress(
  _email: string,
  a: Omit<Address, "id"> & { id?: number | string }
) {
  await httpPost("/api/account/addresses", {
    street: a.street,
    city: a.city,
    state: a.state,
    zip: a.zip ?? null,
  });
  return listAddresses("");
}

/** Remove endereço e retorna lista atualizada */
export async function deleteAddress(_email: string, id: number | string) {
  await httpDelete(`/api/account/addresses/${id}`);
  return listAddresses("");
}

/** Preferências de comunicação do usuário autenticado */
export async function getPrefs(_email: string) {
  const p = await httpGet<Prefs>("/api/account/prefs");
  return { marketing: !!p?.marketing };
}

export async function savePrefs(_email: string, p: Prefs) {
  const next = await httpPost<Prefs>("/api/account/prefs", { marketing: !!p.marketing });
  return { marketing: !!next.marketing };
}
