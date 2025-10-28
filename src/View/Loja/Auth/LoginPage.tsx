// View/Loja/Auth/LoginPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/States/auth.store";

export default function LojaLoginPage() {
  const nav = useNavigate();
  const { signIn, token } = useAdminAuth();

  const [email, setEmail] = useState("admin@demo.tld");
  const [pwd, setPwd] = useState("admin123");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) nav("/");
  }, [token, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await signIn(email, pwd);
      setLoading(false);
      nav("/");
    } catch (e: any) {
      setLoading(false);
      setErr(e?.message || "Falha no login");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white border rounded p-4 space-y-3">
        <h1 className="font-bold">Entrar</h1>
        {err && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2">{err}</div>}
        <input
          className="border rounded px-3 py-2 w-full"
          type="email"
          placeholder="seu@email.tld"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="border rounded px-3 py-2 w-full"
          type="password"
          placeholder="••••••••"
          value={pwd}
          onChange={e=>setPwd(e.target.value)}
          autoComplete="current-password"
        />
        <button disabled={loading} className="bg-black text-white rounded px-3 py-2 w-full">
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
