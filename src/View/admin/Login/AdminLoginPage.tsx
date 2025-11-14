// admin/LoginPage.tsx
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "@/States/auth.store";

export default function AdminLoginPage() {
  const { isAdmin, signIn, subscribe } = useAdminAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();

  const [email, setEmail] = useState("admin@demo.tld");
  const [pwd, setPwd] = useState("admin123");
  const [showPwd, setShowPwd] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const go = () => {
      if (isAdmin()) nav(sp.get("back") || "/admin", { replace: true });
    };
    const unsub = typeof subscribe === "function" ? subscribe(go) : undefined;
    go();
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [isAdmin, nav, sp, subscribe]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setErr(null);
    setLoading(true);
    const ok = await signIn(email, pwd);
    setLoading(false);
    if (!ok) setErr("Credenciais inválidas. Dica: senha é “admin123”.");
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center text-white font-bold">
            M
          </div>
          <div>
            <div className="font-extrabold leading-tight">Mobiliário • Admin</div>
            <div className="text-xs text-slate-500 -mt-0.5">Acesso ao painel</div>
          </div>
        </div>

        {err && (
          <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 text-rose-700 text-sm px-3 py-2">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Email</span>
            <input
              type="email"
              className="rounded-md border border-slate-200/60 bg-slate-50 px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@demo.tld"
              autoComplete="username"
              required
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Senha</span>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                className="w-full rounded-md border border-slate-200/60 bg-slate-50 px-3 py-2 pr-10 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="•••••••• (admin123)"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 grid place-items-center text-slate-500 hover:text-slate-700"
                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                title={showPwd ? "Ocultar senha" : "Mostrar senha"}
                tabIndex={0}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button
            disabled={loading}
            className="mt-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
