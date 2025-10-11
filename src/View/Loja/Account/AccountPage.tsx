// src/View/Loja/Account/AccountPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@comp/home/Navbar";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";
import { useAccountController } from "@controller/Loja/account.controller";
import { LogOut, Mail, User as UserIcon, MapPin, Heart, Bell, Package } from "lucide-react";

type Tab = "overview" | "profile" | "addresses" | "orders" | "prefs";

export default function AccountPage() {
  const cart = useCartStore();
  const ui = useUIStore();

  const { user, orders, addresses, prefs, loading, signIn, signOut, updateProfile, saveAddress, removeAddress, updatePrefs } =
    useAccountController();

  const [tab, setTab] = useState<Tab>("overview");

  const menuOpen = ui.menuOpen;
  const setMenuOpenProp = (v: boolean) => {
    const anyStore = ui as any;
    if (typeof anyStore.setMenuOpen === "function") {
      if (anyStore.setMenuOpen.length >= 1) anyStore.setMenuOpen(v);
      else anyStore.setMenuOpen();
    } else if (typeof anyStore.toggleMenu === "function") {
      if (!!menuOpen !== !!v) anyStore.toggleMenu();
    }
  };

  // auth form
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  // address form
  const [addr, setAddr] = useState({ street: "", city: "", state: "", zip: "" });

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if ((user as any)?.name) setName((user as any).name);
  }, [user?.email]);

  const totalQty = cart.totalQty;
  const wishlistCount = cart.wishlistCount;

  const sections = useMemo(
    () => [
      { id: "overview", label: "Visão geral" },
      { id: "profile", label: "Detalhes do perfil" },
      { id: "addresses", label: "Endereços" },
      { id: "orders", label: "Pedidos" },
      { id: "prefs", label: "Preferências" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        sections={[]}
        active=""
        cartCount={totalQty}
        wishlistCount={wishlistCount}
        searchQuery={""}
        setSearchQuery={() => {}}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpenProp}
        smoothScrollTo={() => {}}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-700">Minha conta</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">Minha conta</h1>

        {/* Se não logado: identificação simples */}
        {!user && (
          <section className="max-w-2xl rounded-xl border border-slate-200/40 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Identificação</h2>
            <div className="grid gap-3">
              <label className="text-sm text-gray-600">Nome</label>
              <input
                className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
              <label className="text-sm text-gray-600 mt-2">Email</label>
              <input
                className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => signIn({ name: name || "Convidado", email: email || undefined })}
                  className="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 transition-colors"
                >
                  Continuar
                </button>
                <Link
                  to="/"
                  className="rounded-md border border-slate-200/60 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-5 py-2.5 transition-colors"
                >
                  Voltar
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Logado */}
        {user && (
          <div className="mt-2 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            {/* Side nav */}
            <aside className="rounded-xl border border-slate-200/40 bg-white p-4 shadow-sm">
              <nav className="grid gap-1">
                <button
                  onClick={() => setTab("overview")}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    tab === "overview" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="w-5 h-5 grid place-items-center rounded-full bg-blue-100 text-blue-700">🏠</span>
                  Visão geral
                </button>
                <button
                  onClick={() => setTab("profile")}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    tab === "profile" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                  }`}
                >
                  <UserIcon className="w-4 h-4" /> Detalhes do perfil
                </button>
                <button
                  onClick={() => setTab("addresses")}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    tab === "addresses" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="w-4 h-4" /> Endereços
                </button>
                <button
                  onClick={() => setTab("orders")}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    tab === "orders" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                  }`}
                >
                  <Package className="w-4 h-4" /> Pedidos
                </button>
                <button
                  onClick={() => setTab("prefs")}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    tab === "prefs" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                  }`}
                >
                  <Bell className="w-4 h-4" /> Preferências
                </button>

                <div className="h-px bg-slate-200/60 my-2" />
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </nav>
            </aside>

            {/* Content */}
            <section className="space-y-6">
              {loading && (
                <div className="rounded-xl border border-slate-200/40 bg-white p-6 shadow-sm">
                  Carregando…
                </div>
              )}

              {!loading && tab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-slate-200/40 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 grid place-items-center rounded-full bg-blue-100 text-blue-700">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Detalhes do perfil</div>
                        <div className="text-sm text-gray-500">Editar</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/40 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 grid place-items-center rounded-full bg-blue-100 text-blue-700">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Endereços</div>
                        <div className="text-sm text-gray-500">Adicionar novo</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/40 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 grid place-items-center rounded-full bg-blue-100 text-blue-700">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Lista de desejos</div>
                        <div className="text-sm text-gray-500">Ver todos</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/40 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 grid place-items-center rounded-full bg-blue-100 text-blue-700">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Preferências</div>
                        <div className="text-sm text-gray-500">Gerenciar</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!loading && tab === "profile" && (
                <div className="rounded-xl border border-slate-200/40 bg-white p-6 shadow-sm max-w-2xl">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfil</h2>
                  <div className="grid gap-3">
                    <label className="text-sm text-gray-600">Nome</label>
                    <input
                      className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <label className="text-sm text-gray-600 mt-2">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <input
                        className="flex-1 rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => updateProfile({ name, email })}
                      className="mt-4 w-fit rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 transition-colors"
                    >
                      Salvar alterações
                    </button>
                  </div>
                </div>
              )}

              {!loading && tab === "addresses" && (
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-slate-200/40 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Meus endereços</h2>
                    <div className="space-y-3">
                      {addresses.length === 0 && <div className="text-sm text-gray-500">Nenhum endereço.</div>}
                      {addresses.map((a: any) => (
                        <div key={a.id} className="rounded-lg border border-slate-200/60 p-3 flex justify-between items-start">
                          <div className="text-sm text-gray-700">
                            {a.street}, {a.city} - {a.state}, {a.zip}
                          </div>
                          <button
                            onClick={() => removeAddress(a.id)}
                            className="text-rose-600 hover:underline text-sm"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/40 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Adicionar/Editar</h2>
                    <div className="grid gap-3">
                      <input
                        className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm"
                        placeholder="Rua"
                        value={addr.street}
                        onChange={(e) => setAddr({ ...addr, street: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm"
                          placeholder="Cidade"
                          value={addr.city}
                          onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                        />
                        <input
                          className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm"
                          placeholder="Estado"
                          value={addr.state}
                          onChange={(e) => setAddr({ ...addr, state: e.target.value })}
                        />
                      </div>
                      <input
                        className="rounded-md border border-slate-200/60 bg-white px-3 py-2 text-sm"
                        placeholder="CEP"
                        value={addr.zip}
                        onChange={(e) => setAddr({ ...addr, zip: e.target.value })}
                      />
                      <button
                        onClick={async () => {
                          await saveAddress(addr);
                          setAddr({ street: "", city: "", state: "", zip: "" });
                        }}
                        className="mt-1 w-fit rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 transition-colors"
                      >
                        Salvar endereço
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!loading && tab === "orders" && (
                <div className="rounded-xl border border-slate-200/40 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Meus pedidos</h2>
                  {orders.length === 0 ? (
                    <div className="text-sm text-gray-500">Nenhum pedido.</div>
                  ) : (
                    <div className="divide-y divide-slate-200/60">
                      {orders.map((o: any) => (
                        <div key={o.id} className="py-4 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Pedido #{o.id}</div>
                            <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="text-sm text-gray-700">
                            {o.items?.length ?? 0} itens • Total {Number(o.total ?? o.subtotal).toLocaleString("pt-MZ",{style:"currency",currency:"MZN"})}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!loading && tab === "prefs" && (
                <div className="rounded-xl border border-slate-200/40 bg-white p-6 shadow-sm max-w-xl">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferências de comunicação</h2>
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={!!prefs.marketing}
                      onChange={(e) => updatePrefs({ marketing: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Receber emails de ofertas e novidades
                  </label>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
