// View/Loja/Auth/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpPost } from "@/Utils/api";
import { useAuthStore } from "@/States/auth.store";

export default function LojaLoginPage() {
  const nav = useNavigate();
  const { isLogged } = useAuthStore();
  const [email, setEmail] = useState("admin@demo.tld");
  const [pwd, setPwd] = useState("admin123");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const { token, user } = await httpPost<{token:string; user:any}>("/api/auth/login", { email, password: pwd });
      // reaproveita o localStorage do state/auth.store.ts
      const LS = "mobiliario:auth_v1";
      localStorage.setItem(LS, JSON.stringify({ token, user }));
      setLoading(false);
      nav("/");
    } catch (e:any) {
      setLoading(false);
      setErr(e?.message || "Falha no login");
    }
  }

  if (isLogged()) nav("/");

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white border rounded p-4 space-y-3">
        <h1 className="font-bold">Entrar</h1>
        {err && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2">{err}</div>}
        <input className="border rounded px-3 py-2 w-full" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} />
        <button disabled={loading} className="bg-black text-white rounded px-3 py-2 w-full">{loading ? "Entrando…" : "Entrar"}</button>
      </form>
    </div>
  );
}
