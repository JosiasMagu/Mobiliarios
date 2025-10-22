// utils/api.ts
const BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/,'') || "http://localhost:8080";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j?.error || j?.message || msg; } catch {}
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
