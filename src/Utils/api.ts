// src/Utils/api.ts
const RAW = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const BASE = RAW.replace(/\/+$/, "");

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = (j && (j.error || j.message)) || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function httpGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: "omit",
  });
  return handle<T>(res);
}

export async function httpPost<T>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
    credentials: "omit",
  });
  return handle<T>(res);
}

export async function httpPatch<T>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
    credentials: "omit",
  });
  return handle<T>(res);
}

export async function httpPut<T>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
    credentials: "omit",
  });
  return handle<T>(res);
}

export async function httpDelete<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: "omit",
  });
  // alguns DELETE devolvem 204 sem body
  if (res.status === 204) return undefined as unknown as T;
  return handle<T>(res);
}
