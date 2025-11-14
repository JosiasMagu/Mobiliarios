import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthService } from "@/Services/auth.service";

export default function LojaLoginPage() {
  const nav = useNavigate();
  const [sp] = useSearchParams();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // se já estiver autenticado ao abrir a página, redireciona
  useEffect(() => {
    const t = AuthService.token();
    if (!t) return;
    const back = sp.get("back") || "/";
    nav(back, { replace: true });
  }, [nav, sp]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await AuthService.login(email, pwd);
      // redireciona imediatamente após login
      const back = sp.get("back") || "/";
      nav(back, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4"
      >
        <h1 className="text-xl font-bold text-center text-gray-800">Entrar</h1>
        {err && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2">
            {err}
          </div>
        )}
        <div className="grid gap-3">
          <input
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            type="password"
            placeholder="Senha"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-md bg-black hover:bg-gray-900 text-white font-semibold py-2.5 text-sm disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Ainda não tem conta?{" "}
          <span
            onClick={() => nav("/signup")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Criar conta
          </span>
        </p>
      </form>
    </div>
  );
}
