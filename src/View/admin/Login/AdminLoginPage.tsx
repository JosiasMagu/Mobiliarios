// admin/LoginPage.tsx
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAdminAuth } from "@/States/auth.store";

export default function AdminLoginPage() {
  const { isAdmin, signIn, subscribe } = useAdminAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [email, setEmail] = useState("admin@demo.tld");
  const [pwd, setPwd] = useState("admin123");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const go = () => { if (isAdmin()) nav(sp.get("back") || "/admin", { replace: true }); };
    const unsub = typeof subscribe === "function" ? subscribe(go) : undefined;
    go();
    return () => { if (typeof unsub === "function") unsub(); };
  }, [isAdmin, nav, sp, subscribe]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    const ok = await signIn(email, pwd);
    setLoading(false);
    if (!ok) setErr("Credenciais inválidas. Dica: senha é “admin123”.");
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center text-white font-bold">M</div>
          <div>
            <div className="font-extrabold leading-tight">Mobiliário • Admin</div>
            <div className="text-xs text-slate-500 -mt-0.5">Acesso ao painel</div>
          </div>
        </div>

        {err && <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 text-rose-700 text-sm px-3 py-2">{err}</div>}

        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Email</span>
            <input className="rounded-md border border-slate-200/60 bg-slate-50 px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="admin@demo.tld" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Senha</span>
            <input type="password" className="rounded-md border border-slate-200/60 bg-slate-50 px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              value={pwd} onChange={(e)=>setPwd(e.target.value)} placeholder="•••••••• (admin123)" />
          </label>
          <button disabled={loading} className="mt-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 disabled:opacity-50">
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
