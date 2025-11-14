// src/View/Loja/Institutional/ContactPage.tsx
import { useState } from "react";
import { Navbar } from "@comp/home/Navbar";
import { Footer } from "@comp/layout/footer";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";
import { sendContact } from "@service/contact.service";

export default function ContactPage() {
  const cart = useCartStore();
  const ui = useUIStore();

  // compat: aceita (v:boolean) mesmo que o store tenha toggle()
  const setMenuOpenProp = (v: boolean) => {
    const anyStore = ui as any;
    const isOpen = !!ui.menuOpen;
    if (typeof anyStore.setMenuOpen === "function") {
      anyStore.setMenuOpen.length ? anyStore.setMenuOpen(v) : anyStore.setMenuOpen();
    } else if (typeof anyStore.toggleMenu === "function" && isOpen !== !!v) {
      anyStore.toggleMenu();
    }
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);
    try {
      await sendContact({ name, email, message });
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        sections={[]}
        active=""
        cartCount={cart.totalQty}
        wishlistCount={cart.wishlistCount}
        searchQuery=""
        setSearchQuery={() => {}}
        menuOpen={ui.menuOpen}
        setMenuOpen={setMenuOpenProp}
        smoothScrollTo={() => {}}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Contato</h1>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <form
            onSubmit={onSubmit}
            className="rounded-xl border border-slate-200/40 bg-white p-6 space-y-4 shadow-sm"
          >
            {sent && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800 text-sm">
                Mensagem enviada! Em breve entraremos em contacto.
              </div>
            )}

            <div>
              <label className="text-sm text-slate-600" htmlFor="name">
                Nome
              </label>
              <input
                id="name"
                className="mt-1 w-full rounded-md border border-slate-200/60 bg-slate-50 px-3 py-2
                           focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label className="text-sm text-slate-600" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 w-full rounded-md border border-slate-200/60 bg-slate-50 px-3 py-2
                           focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-sm text-slate-600" htmlFor="message">
                Mensagem
              </label>
              <textarea
                id="message"
                className="mt-1 w-full rounded-md border border-slate-200/60 bg-slate-50 px-3 py-2 min-h-[120px]
                           focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 disabled:opacity-50"
            >
              {loading ? "Enviando…" : "Enviar Mensagem"}
            </button>

            {/* Info de contato rápida */}
            <div className="pt-2 text-sm text-slate-600">
              <p className="font-medium text-slate-700">Telefone/WhatsApp</p>
              <p>+258 84 000 0000</p>
              <p className="mt-2 font-medium text-slate-700">Email</p>
              <p>suporte@mobiliarte.co.mz</p>
              <p className="mt-2 font-medium text-slate-700">Endereço</p>
              <p>Beira, Sofala — Moçambique</p>
            </div>
          </form>

          {/* Mapa – Beira, Moçambique */}
          <div className="rounded-xl overflow-hidden border border-slate-200/40 bg-white shadow-sm">
            <iframe
              title="Mapa — Beira, Moçambique"
              className="w-full h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              // usa consulta direta para Beira; funciona sem chave
              src="https://www.google.com/maps?q=Beira,+Mozambique&output=embed"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
