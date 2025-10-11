// src/View/Loja/Product/ProductPage.tsx
import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProductController } from "@controller/Loja/product.controller";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";
import { Navbar } from "@comp/home/Navbar";
import { Gallery } from "@comp/produto/Gallery";
import { currency } from "@utils/currency";
import { Star, ShoppingCart, Heart, Package, Truck } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams();
  const pid = Number(id);

  const { loading, err, product, related, qty, setQty, minQty, maxQty, canAdd } =
    useProductController(pid);

  const cartStore = useCartStore();
  const uiStore = useUIStore();
  const addItem = cartStore.addItem;
  const totalQty = cartStore.totalQty;
  const wishlistCount = cartStore.wishlistCount;
  const menuOpen = uiStore.menuOpen;
  const setMenuOpenProp = (v: boolean) => {
    const anyStore = uiStore as any;
    if (typeof anyStore.setMenuOpen === "function") {
      if (anyStore.setMenuOpen.length >= 1) anyStore.setMenuOpen(v);
      else anyStore.setMenuOpen();
    } else if (typeof anyStore.toggleMenu === "function") {
      if (!!menuOpen !== !!v) anyStore.toggleMenu();
    }
  };

  const [zip, setZip] = useState("");

  // imagens
  const toStrArray = (x: unknown): string[] =>
    Array.isArray(x) ? (x.filter(Boolean) as unknown[]).map(String) : [];

  const gallery: string[] = useMemo(() => {
    const p: any = product ?? {};
    const base =
      toStrArray(p.gallery).length
        ? toStrArray(p.gallery)
        : toStrArray(p.images).length
        ? toStrArray(p.images)
        : toStrArray([p.image]);
    const uniq = Array.from(new Set(base));
    return (uniq.length ? uniq : ["/placeholder.jpg"]).slice(0, 4);
  }, [product]);

  const mainImage: string = gallery[0];

  if (Number.isNaN(pid)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white border rounded-2xl p-10 shadow">
          <span className="material-symbols-outlined text-5xl text-rose-500 mb-3 inline-block">error</span>
          <p className="text-rose-600 text-lg">ID inválido.</p>
        </div>
      </main>
    );
  }

  if (loading || err || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar
          sections={[]} active=""
          cartCount={totalQty} wishlistCount={wishlistCount}
          searchQuery="" setSearchQuery={() => {}}
          menuOpen={menuOpen} setMenuOpen={setMenuOpenProp}
          smoothScrollTo={() => {}}
        />

        <main className="max-w-5xl mx-auto px-4 pt-10 pb-12">
          {loading ? (
            <div className="bg-white border rounded-2xl p-10 shadow text-center">
              <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-slate-600">A carregar…</p>
            </div>
          ) : (
            <div className="bg-white border rounded-2xl p-10 shadow text-center">
              <span className="material-symbols-outlined text-5xl text-rose-500 mb-3 inline-block">error</span>
              <p className="text-rose-600 text-lg mb-5">{err ?? "Erro ao carregar produto"}</p>
              <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:opacity-95">
                <span className="material-symbols-outlined">home</span>
                Voltar à Home
              </Link>
            </div>
          )}
        </main>
      </div>
    );
  }

  const price = Number((product as any).price);
  const originalPrice = (product as any).originalPrice;
  const inStock = Boolean((product as any).inStock);
  const categorySlug = (product as any).categorySlug;

  const handleAdd = () =>
    addItem(
      { productId: Number(product.id), name: product.name, price, image: mainImage },
      qty
    );

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50">
      <Navbar
        sections={[]} active=""
        cartCount={totalQty} wishlistCount={wishlistCount}
        searchQuery="" setSearchQuery={() => {}}
        menuOpen={menuOpen} setMenuOpen={setMenuOpenProp}
        smoothScrollTo={() => {}}
      />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* breadcrumb sem animação */}
          <div className="mb-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            {categorySlug && (
              <>
                <span className="mx-2">/</span>
                <Link to={`/c/${categorySlug}`} className="hover:text-gray-700">
                  {categorySlug.replace(/-/g, " ")}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-700">{product.name}</span>
          </div>

          {/* grid sem animação para evitar artefato */}
          <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-2">
            <div className="rounded-lg">
              <Gallery images={gallery} />
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-3 text-sm text-gray-500">
                  {categorySlug ? (
                    <>
                      <Link className="hover:text-gray-700 transition-colors" to={`/c/${categorySlug}`}>
                        {categorySlug.replace(/-/g, " ")}
                      </Link>
                      <span className="mx-2">/</span>
                    </>
                  ) : null}
                  <span className="font-medium text-gray-700">Produto</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                  {product.name}
                </h1>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Peça com design moderno, materiais selecionados e conforto para uso diário. Ajuste a quantidade e adicione ao carrinho.
                </p>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">{currency(price)}</span>
                {originalPrice ? (
                  <span className="text-sm text-gray-500 line-through">{currency(Number(originalPrice))}</span>
                ) : null}
                <span className="text-sm text-gray-500">em até 12x sem juros</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="inline-flex items-center rounded-md border border-gray-300 bg-white">
                  <button onClick={() => setQty(Math.max(minQty, qty - 1))} className="px-3 py-2 hover:bg-gray-50" aria-label="Diminuir quantidade">−</button>
                  <input
                    value={qty}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      const v = Number.isNaN(n) ? minQty : Math.max(minQty, Math.min(maxQty, n));
                      setQty(v);
                    }}
                    type="number" min={minQty} max={maxQty}
                    className="w-16 text-center py-2 outline-none"
                  />
                  <button onClick={() => setQty(Math.min(maxQty, qty + 1))} className="px-3 py-2 hover:bg-gray-50" aria-label="Aumentar quantidade">+</button>
                </div>

                <button
                  className={`flex-1 rounded-md px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors flex items-center justify-center gap-2 ${canAdd && inStock ? "bg-[#1173d4] hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
                  disabled={!canAdd || !inStock}
                  onClick={handleAdd}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Adicionar ao Carrinho
                </button>

                <button className="flex-1 rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5" />
                  Lista de Desejos
                </button>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#1173d4]" />
                  Informações Adicionais
                </h2>
                <div className="mt-4 space-y-4 text-sm">
                  <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                    <dt className="font-medium text-gray-500">Medidas</dt>
                    <dd className="col-span-2 text-gray-700">280cm (L) × 160cm (P) × 85cm (A)</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                    <dt className="font-medium text-gray-500">Dimensões</dt>
                    <dd className="col-span-2 text-gray-700">Módulos: 80cm × 80cm × 85cm</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                    <dt className="font-medium text-gray-500">Materiais</dt>
                    <dd className="col-span-2 text-gray-700">Madeira maciça, tecido poliéster, espuma alta densidade</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
                    <dt className="font-medium text-gray-500">Disponibilidade</dt>
                    <dd className={`col-span-2 font-semibold ${inStock ? "text-emerald-600" : "text-rose-600"} flex items-center gap-1`}>
                      <div className={`h-2 w-2 rounded-full ${inStock ? "bg-emerald-600" : "bg-rose-600"}`}></div>
                      {inStock ? "Em estoque" : "Indisponível"}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2 pt-2">
                    <dt className="font-medium text-gray-500 flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      Entrega
                    </dt>
                    <dd className="col-span-2">
                      <div className="flex gap-2">
                        <input
                          className="flex-1 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                          placeholder="Digite seu CEP"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                        />
                        <button className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors">
                          Calcular
                        </button>
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Avaliações */}
          <section className="mt-16 rounded-lg border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Avaliações de Clientes</h2>

            <div className="mt-6 flex flex-wrap items-start gap-8">
              <div className="flex flex-col items-center">
                <p className="text-5xl font-bold text-gray-900">
                  {Number((product as any).rating ?? 4.5).toFixed(1)}
                </p>
                <div className="mt-1 flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.round((product as any).rating ?? 4.5) ? "fill-current" : "fill-gray-300 text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Baseado em {(product as any).reviews ?? 0} avaliações
                </p>
              </div>

              <div className="flex-1 min-w-[250px]">
                <div className="space-y-2">
                  {[40, 30, 15, 10, 5].map((pct, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 w-3">{5 - idx}</span>
                      <div className="h-2 flex-1 rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-yellow-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm text-gray-500 w-10 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* reviews fictícios */}
            <div className="mt-10 space-y-8 divide-y divide-gray-200">
              {[
                {
                  name: "Sofia Almeida",
                  date: "15 de julho de 2023",
                  rating: 5,
                  comment:
                    "Sofá excelente! Muito confortável e o tecido é de ótima qualidade. A configuração modular é prática e se adapta ao meu espaço.",
                  avatar:
                    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=128&h=128&fit=crop&crop=faces",
                },
                {
                  name: "Lucas Pereira",
                  date: "22 de junho de 2023",
                  rating: 4,
                  comment:
                    "Bonito e confortável. Prazo de entrega poderia ser menor, mas a compra valeu a pena.",
                  avatar:
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=faces",
                },
                {
                  name: "Isabela Costa",
                  date: "5 de junho de 2023",
                  rating: 5,
                  comment: "Exatamente como nas fotos. A cor neutra combina com tudo. Entrega rápida.",
                  avatar:
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=faces",
                },
              ].map((r, idx) => (
                <div key={idx} className="pt-8">
                  <div className="flex items-start gap-4">
                    <img
                      alt={`Avatar de ${r.name}`}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
                      src={r.avatar}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{r.name}</h4>
                        <span className="text-xs text-gray-500">{r.date}</span>
                      </div>
                      <div className="mt-1 flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < r.rating ? "fill-current" : "fill-gray-300 text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {(related ?? []).length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Produtos Relacionados</h2>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {related.map((p) => (
                  <div key={p.id} className="group relative">
                    <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-95 transition-opacity">
                      <img
                        alt={p.name}
                        className="h-full w-full object-cover object-center transform transition-transform duration-300 group-hover:scale-110"
                        src={(p as any).image ?? (p as any).images?.[0] ?? "/placeholder.jpg"}
                        loading="lazy" decoding="async"
                        srcSet={`${(p as any).image}?w=320 320w, ${(p as any).image}?w=640 640w`}
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 260px"
                      />
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div>
                        <h3 className="text-sm text-gray-700">
                          <Link to={`/p/${p.id}`} className="font-medium text-gray-900 hover:text-[#1173d4] transition-colors">
                            {p.name}
                          </Link>
                        </h3>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {currency(Number((p as any).price))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
