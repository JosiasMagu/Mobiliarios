export function getItem(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
export function setItem(key: string, val: string) {
  try { localStorage.setItem(key, val); } catch {}
}
export function removeItem(key: string) {
  try { localStorage.removeItem(key); } catch {}
}
export function getJSON<T>(key: string, fallback: T): T {
  const raw = getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}
export function setJSON(key: string, val: unknown) {
  setItem(key, JSON.stringify(val));
}
