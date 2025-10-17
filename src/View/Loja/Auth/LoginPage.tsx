import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Navbar } from "@comp/home/Navbar";
import { Footer } from "@comp/layout/footer";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";
import { useAuthStore } from "@state/auth.store";

export default function LoginPage() {
  const cart = useCartStore(); const ui = useUIStore(); const auth = useAuthStore();
  const nav = useNavigate(); const loc = useLocation();

  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); const [err, setErr] = useState<string | null>(null);

  const setMenuOpenProp = (v: boolean) => {
    const anyStore = ui as any; const isOpen = !!ui.menuOpen;
    if (typeof anyStore.setMenuOpen === "function") (anyStore.setMenuOpen.length ? anyStore.setMenuOpen(v) : anyStore.setMenuOpen());
    else if (typeof anyStore.toggleMenu === "function" && isOpen !== !!v) anyStore.toggleMenu();
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      await auth.signIn(email, password);
      const back = (new URLSearchParams(loc.search)).get("back") || "/account";
      nav(back, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Falha ao entrar");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        sections={[]} active=""
        cartCount={cart.totalQty} wishlistCount={0}
        searchQuery="" setSearchQuery={() => {}}
        menuOpen={ui.menuOpen} setMenuOpen={setMenuOpenProp}
        smoothScrollTo={() => {}}
      />

      <main className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Entrar</h1>
        <form onSubmit={onSubmit} className="mt-6 rounded-xl border border-slate-200/40 bg-white p-6 space-y-4 shadow-sm">
          {err && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 text-sm">{err}</div>}
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200/60 bg-slate-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Senha</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200/60 bg-slate-50 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button disabled={loading} className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 disabled:opacity-50">
            {loading ? "Entrando…" : "Entrar"}
          </button>

          <div className="text-xs text-slate-600 text-center">
            Ou continue como <Link to="/checkout?guest=1" className="text-blue-700 font-semibold">convidado</Link>.
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
