// src/Repository/customer.repository.ts
export type CustomerProfile = { id: string; name: string; email: string };
export type Address = {
  id: string;
  street: string; city: string; state: string; zip: string;
};
export type Prefs = { marketing: boolean };

const db: {
  profiles: Record<string, CustomerProfile>;
  addresses: Record<string, Address[]>;
  prefs: Record<string, Prefs>;
} = { profiles: {}, addresses: {}, prefs: {} };

const uid = () => Math.random().toString(36).slice(2);

export async function getOrCreateProfile(email: string, name?: string): Promise<CustomerProfile> {
  const key = email.toLowerCase();
  if (!db.profiles[key]) {
    db.profiles[key] = { id: uid(), name: name || email.split("@")[0], email };
    db.addresses[key] = [];
    db.prefs[key] = { marketing: false };
  }
  return db.profiles[key];
}

export async function saveProfile(p: CustomerProfile) {
  db.profiles[p.email.toLowerCase()] = p;
  return p;
}

export async function listAddresses(email: string) {
  return [...(db.addresses[email.toLowerCase()] ?? [])];
}

export async function upsertAddress(email: string, a: Omit<Address, "id"> & { id?: string }) {
  const key = email.toLowerCase();
  const arr = db.addresses[key] ?? (db.addresses[key] = []);
  if (a.id) {
    const i = arr.findIndex(x => x.id === a.id);
    if (i >= 0) arr[i] = { ...(arr[i]), ...a } as Address;
    else arr.push({ ...(a as any) });
  } else {
    arr.push({ id: uid(), ...a });
  }
  return listAddresses(email);
}

export async function deleteAddress(email: string, id: string) {
  const key = email.toLowerCase();
  db.addresses[key] = (db.addresses[key] ?? []).filter(a => a.id !== id);
  return listAddresses(email);
}

export async function getPrefs(email: string) {
  return db.prefs[email.toLowerCase()] ?? { marketing: false };
}

export async function savePrefs(email: string, p: Prefs) {
  db.prefs[email.toLowerCase()] = p;
  return p;
}
