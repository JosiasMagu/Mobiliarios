import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Navbar } from "@comp/home/Navbar";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";
import { useAccountController } from "@controller/Loja/account.controller";
import { LogOut, Mail, User as UserIcon, MapPin, Heart, Bell, Package } from "lucide-react";

type Tab = "overview" | "profile" | "addresses" | "orders" | "prefs";
type AddressForm = { provincia: string; cidade: string; bairro: string; referencia: string };

export default function AccountPage() {
  const cart = useCartStore();
  const ui = useUIStore();
  const nav = useNavigate();
  const { user, orders, addresses, prefs, loading, signOut, updateProfile, saveAddress, removeAddress, updatePrefs } =
    useAccountController();

  const [tab, setTab] = useState<Tab>("overview");

  const userName = useMemo(() => (user as any)?.name ?? "", [user]);
  const userEmail = user?.email ?? "";

  const [email, setEmail] = useState(userEmail);
  const [name, setName] = useState(userName);

  const lastUserId = useRef<string | number | null>(null);
  useEffect(() => {
    const id = (user as any)?.id ?? null;
    if (id !== lastUserId.current) {
      lastUserId.current = id;
      setEmail(userEmail || "");
      setName(userName || "");
    }
  }, [user, userEmail, userName]);

  const [addr, setAddr] = useState<AddressForm>({ provincia: "", cidade: "", bairro: "", referencia: "" });

  if (!loading && !user) return <Navigate to="/login?back=/account" replace />;

  const setMenuOpen = (v: boolean) => {
    const anyStore = ui as any;
    if (typeof anyStore.setMenuOpen === "function") {
      anyStore.setMenuOpen.length ? anyStore.setMenuOpen(v) : anyStore.setMenuOpen();
    } else if (typeof anyStore.toggleMenu === "function" && !!ui.menuOpen !== !!v) {
      anyStore.toggleMenu();
    }
  };

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
        setMenuOpen={setMenuOpen}
        smoothScrollTo={() => {}}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-700">Minha conta</span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Minha conta</h1>
          {loading && <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 ring-1 ring-blue-200">Atualizando…</span>}
        </div>

        <div className="mt-2 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <aside className="rounded-xl border border-slate-200/40 bg-white p-4 shadow-sm">
            <nav className="grid gap-1">
              <TabBtn label="Visão geral" active={tab === "overview"} onClick={() => setTab("overview")} icon={<span className="w-5 h-5 grid place-items-center rounded-full bg-blue-100 text-blue-700">🏠</span>} />
              <TabBtn label="Detalhes do perfil" active={tab === "profile"} onClick={() => setTab("profile")} icon={<UserIcon className="w-4 h-4" />} />
              <TabBtn label="Endereços" active={tab === "addresses"} onClick={() => setTab("addresses")} icon={<MapPin className="w-4 h-4" />} />
              <TabBtn label="Pedidos" active={tab === "orders"} onClick={() => setTab("orders")} icon={<Package className="w-4 h-4" />} />
              <TabBtn label="Preferências" active={tab === "prefs"} onClick={() => setTab("prefs")} icon={<Bell className="w-4 h-4" />} />
              <div className="h-px bg-slate-200/60 my-2" />
              <button
                onClick={() => { signOut(); nav("/login", { replace: true }); }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </nav>
          </aside>

          <section className="space-y-6">
            {/* NUNCA bloqueie o conteúdo por causa do loading */}
            {tab === "overview" && (
              <div className="grid md:grid-cols-2 gap-6">
                <Tile icon={<UserIcon className="w-4 h-4" />} title="Detalhes do perfil" subtitle="Editar" />
                <Tile icon={<MapPin className="w-4 h-4" />} title="Endereços" subtitle="Adicionar novo" />
                <Tile icon={<Heart className="w-4 h-4" />} title="Lista de desejos" subtitle="Ver todos" />
                <Tile icon={<Bell className="w-4 h-4" />} title="Preferências" subtitle="Gerenciar" />
              </div>
            )}

            {tab === "profile" && (
              <Panel className="max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfil</h2>
                <div className="grid gap-3">
                  <label className="text-sm text-gray-600">Nome</label>
                  <input className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
                  <label className="text-sm text-gray-600 mt-2">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <input className="flex-1 rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <button onClick={() => updateProfile({ name, email })} className="mt-4 w-fit rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5">
                    Salvar alterações
                  </button>
                </div>
              </Panel>
            )}

            {tab === "addresses" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Panel>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Meus endereços</h2>
                  <div className="space-y-3">
                    {addresses.length === 0 && <div className="text-sm text-gray-500">Nenhum endereço.</div>}
                    {addresses.map((a: any) => (
                      <div key={a.id} className="rounded-lg border border-slate-200/60 p-3 flex justify-between items-start">
                        <div className="text-sm text-gray-700">
                          {a.provincia}, {a.cidade} — {a.bairro}{a.referencia ? `, ref.: ${a.referencia}` : ""}
                        </div>
                        <button onClick={() => removeAddress(a.id)} className="text-rose-600 hover:underline text-sm">Remover</button>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Adicionar/Editar</h2>
                  <div className="grid gap-3">
                    <input className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm" placeholder="Província" value={addr.provincia} onChange={(e) => setAddr({ ...addr, provincia: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm" placeholder="Cidade" value={addr.cidade} onChange={(e) => setAddr({ ...addr, cidade: e.target.value })} />
                      <input className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm" placeholder="Bairro" value={addr.bairro} onChange={(e) => setAddr({ ...addr, bairro: e.target.value })} />
                    </div>
                    <input className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm" placeholder="Ponto de referência (opcional)" value={addr.referencia} onChange={(e) => setAddr({ ...addr, referencia: e.target.value })} />
                    <button
                      onClick={async () => {
                        await saveAddress(addr);
                        setAddr({ provincia: "", cidade: "", bairro: "", referencia: "" });
                      }}
                      className="mt-1 w-fit rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5"
                    >
                      Salvar endereço
                    </button>
                  </div>
                </Panel>
              </div>
            )}

            {tab === "orders" && (
              <Panel>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Meus pedidos</h2>
                {orders.length === 0 ? (
                  <div className="text-sm text-gray-500">Nenhum pedido.</div>
                ) : (
                  <div className="divide-y divide-slate-200/60">
                    {orders.map((o: any) => (
                      <div key={o.id} className="py-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{o.number ?? `#${o.id}`}</div>
                          <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString("pt-MZ")}</div>
                        </div>
                        <div className="text-sm text-gray-700">
                          {(o.items?.length ?? 0)} itens •{" "}
                          {Number((o.total ?? o.subtotal) ?? 0).toLocaleString("pt-MZ", { style: "currency", currency: "MZN" })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            )}

            {tab === "prefs" && (
              <Panel className="max-w-xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferências de comunicação</h2>
                <label className="flex items-center gap-3 text-sm text-gray-700">
                  <input type="checkbox" checked={!!prefs.marketing} onChange={(e) => updatePrefs({ marketing: e.target.checked })} className="h-4 w-4 rounded border-slate-300" />
                  Receber emails de ofertas e novidades
                </label>
              </Panel>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* ---------- UI helpers ---------- */
function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200/40 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}
function Tile({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-slate-200/40 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 grid place-items-center rounded-full bg-blue-100 text-blue-700">{icon}</div>
        <div>
          <div className="font-semibold text-gray-900">{title}</div>
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
function TabBtn({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}>
      {icon}
      {label}
    </button>
  );
}
