// src/Utils/api.ts
const RAW = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const BASE = RAW.replace(/\/+$/, "");

/** Lê token de qualquer uma das stores conhecidas, sem depender de imports. */
function readAuthToken(): string | null {
  try {
    const stores = [
      "mobiliario:auth_v1", // store principal
      "admin_auth_v1",      // admin
      "client_auth_v1",     // cliente legado
    ];
    for (const k of stores) {
      const v = localStorage.getItem(k);
      if (!v) continue;
      const obj = JSON.parse(v);
      if (obj?.token) return String(obj.token);
    }
  } catch {}
  return null;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = (j && (j.error || j.message)) || msg;
    } catch {}
    throw new Error(msg);
  }
  // alguns endpoints 204 não têm body
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

function abs(path: string): string {
  // garante “/api/..” com uma única barra
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
}

export async function httpGet<T>(path: string, token?: string): Promise<T> {
  const tk = token ?? readAuthToken() ?? undefined;
  const res = await fetch(abs(path), {
    headers: tk ? { Authorization: `Bearer ${tk}` } : undefined,
    credentials: "omit",
  });
  return handle<T>(res);
}

export async function httpPost<T>(path: string, body: any, token?: string): Promise<T> {
  const tk = token ?? readAuthToken() ?? undefined;
  const res = await fetch(abs(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
    body: JSON.stringify(body),
    credentials: "omit",
  });
  return handle<T>(res);
}

export async function httpPatch<T>(path: string, body: any, token?: string): Promise<T> {
  const tk = token ?? readAuthToken() ?? undefined;
  const res = await fetch(abs(path), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
    body: JSON.stringify(body),
    credentials: "omit",
  });
  return handle<T>(res);
}

export async function httpPut<T>(path: string, body: any, token?: string): Promise<T> {
  const tk = token ?? readAuthToken() ?? undefined;
  const res = await fetch(abs(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) },
    body: JSON.stringify(body),
    credentials: "omit",
  });
  return handle<T>(res);
}

export async function httpDelete<T>(path: string, token?: string): Promise<T> {
  const tk = token ?? readAuthToken() ?? undefined;
  const res = await fetch(abs(path), {
    method: "DELETE",
    headers: tk ? { Authorization: `Bearer ${tk}` } : undefined,
    credentials: "omit",
  });
  return handle<T>(res);
}
