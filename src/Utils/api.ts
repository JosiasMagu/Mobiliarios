// src/Utils/api.ts
export const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");

/** Lê o token em vários formatos e chaves. */
function readAuthToken(): string | null {
  const keys = [
    "mobiliario:auth_v1",
    "admin_auth_v1",
    "client_auth_v1",
    "auth_v1",
    "auth",
    "session",
  ];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const v = JSON.parse(raw);

      if (typeof v === "string" && v.startsWith("eyJ")) return v; // token puro
      if (v?.token) return String(v.token);
      if (v?.accessToken) return String(v.accessToken);
      if (v?.data?.token) return String(v.data.token);
      if (v?.auth?.token) return String(v.auth.token);
    } catch { /* ignore */ }
  }
  return null;
}

function clearAuthAndMaybeRedirect() {
  try {
    ["mobiliario:auth_v1","admin_auth_v1","client_auth_v1","auth_v1","auth","session"]
      .forEach(k => localStorage.removeItem(k));
  } catch {}
  if (typeof window !== "undefined" && location.pathname.startsWith("/admin")) {
    const back = encodeURIComponent(location.pathname + location.search + location.hash);
    location.replace(`/admin/login?back=${back}`);
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) clearAuthAndMaybeRedirect();

    let msg = `HTTP ${res.status}`;
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        if (Array.isArray((j as any)?.issues) && (j as any).issues.length) {
          const errs = (j as any).issues.map((i: any) => i?.message || i?.path?.join(".")).filter(Boolean);
          msg = `${String((j as any).error || (j as any).message || msg)}: ${errs.join("; ")}`;
        } else {
          msg = String((j as any)?.error || (j as any)?.message || msg);
        }
      } else {
        msg = await res.text();
      }
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as unknown as T;
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json")
    ? ((await res.json()) as T)
    : ((await res.text()) as unknown as T);
}

function abs(path: string): string {
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
