import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/Services/auth.service";

export default function SignupPage() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pwd !== confirm) {
      setErr("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await AuthService.register(name, email, pwd);
      nav("/login", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Falha no cadastro");
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
        <h1 className="text-xl font-bold text-center text-gray-800">Criar conta</h1>
        {err && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2">
            {err}
          </div>
        )}
        <div className="grid gap-3">
          <input
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            autoComplete="new-password"
            required
          />
          <input
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            type="password"
            placeholder="Confirmar senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-md bg-black hover:bg-gray-900 text-white font-semibold py-2.5 text-sm disabled:opacity-50"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <span onClick={() => nav("/login")} className="text-blue-600 hover:underline cursor-pointer">
            Entrar
          </span>
        </p>
      </form>
    </div>
  );
}
