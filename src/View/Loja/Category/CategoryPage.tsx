import { useParams, Link } from "react-router-dom";
import { useCategoryController } from "@controller/Loja/category.controller";
import { ProductCard } from "@comp/home/ProductCard";
import { currency } from "@utils/currency";
import { Navbar } from "@comp/home/Navbar";
import { FiltersSidebar } from "@comp/category/FiltersSidebar";
import { SortBar } from "@comp/category/SortBar";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";

function titleFromSlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CategoryPage() {
  const { slug = "" } = useParams();
  const c = useCategoryController(slug);

  const cartStore = useCartStore();
  const uiStore = useUIStore();

  const totalQty = cartStore.totalQty;
  const wishlistCount = cartStore.wishlistCount;
  const addItem = cartStore.addItem;
  const addWish = cartStore.addWish;

  const menuOpen = uiStore.menuOpen;
  // adaptador: aceita boolean e chama método real do store
  const setMenuOpenProp = (v: boolean) => {
    const anyStore = uiStore as any;
    if (typeof anyStore.setMenuOpen === "function") {
      // se a assinatura aceitar 1 arg, passa v; se não, só chama
      if (anyStore.setMenuOpen.length >= 1) anyStore.setMenuOpen(v);
      else anyStore.setMenuOpen();
    } else if (typeof anyStore.toggleMenu === "function") {
      const isOpen = !!menuOpen;
      if (isOpen !== !!v) anyStore.toggleMenu();
    }
  };

  const minPrice =
    c.items.length > 0 ? Math.min(...c.items.map((i) => Number(i.price))) : undefined;
  const maxPrice =
    c.items.length > 0 ? Math.max(...c.items.map((i) => Number(i.price))) : undefined;

  const info =
    c.totalFiltered > 0
      ? `Mostrando ${Math.min(c.page * c.pageSize, c.totalFiltered)} de ${c.totalFiltered} produtos` +
        (typeof minPrice === "number" && typeof maxPrice === "number"
          ? ` • ${currency(minPrice)} – ${currency(maxPrice)}`
          : "")
      : "Nenhum produto";

  const onAddCart = (id: number) => {
    const p = c.items.find((x) => Number(x.id) === Number(id));
    if (!p || !(p as any).inStock) return;
    const image = (p as any).image ?? (p as any).images?.[0];
    addItem({ productId: p.id as any, name: p.name, price: Number(p.price), image }, 1);
  };
  const onAddWish = (id: number) => addWish(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        sections={[]}
        active=""
        cartCount={totalQty}
        wishlistCount={wishlistCount}
        searchQuery={c.q}
        setSearchQuery={(v) => {
          c.setQ(v);
          c.setPage(1);
        }}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpenProp}
        smoothScrollTo={() => {}}
      />

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link className="hover:text-gray-700" to="/">Móveis</Link>
              <span className="material-symbols-outlined text-base align-middle select-none">chevron_right</span>
              <span className="font-semibold text-gray-700">{titleFromSlug(slug)}</span>
            </div>
            <div className="mt-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                {titleFromSlug(slug)}
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Explore nossa seleção de {titleFromSlug(slug).toLowerCase()} para todos os estilos e espaços.
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:gap-8">
            <FiltersSidebar
              q={c.q} setQ={c.setQ}
              min={c.min} setMin={c.setMin}
              max={c.max} setMax={c.setMax}
              inStock={c.inStock} setInStock={c.setInStock}
              color={c.color} setColor={c.setColor}
              material={c.material} setMaterial={c.setMaterial}
              setPage={c.setPage}
              setPriceRange={c.setPriceRange}
              resetFilters={c.resetFilters}
            />

            <section className="w-full lg:w-3/4 mt-8 lg:mt-0">
              <SortBar info={info} sort={c.sort} setSort={c.setSort} />

              {c.loading ? (
                <div className="py-16 text-center text-gray-500">A carregar…</div>
              ) : c.err ? (
                <div className="py-16 text-center text-red-600">Erro: {c.err}</div>
              ) : c.paged.length === 0 ? (
                <div className="py-16 text-center text-gray-500">Nada encontrado com os filtros atuais.</div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
                  {c.paged.map((p) => (
                    <ProductCard
                      key={p.id}
                      p={p}
                      onAddCart={onAddCart}
                      onAddWish={onAddWish}
                    />
                  ))}
                </div>
              )}

              {c.totalFiltered > 0 && (
                <nav className="mt-10 flex items-center justify-center border-t border-gray-200 pt-6">
                  <button
                    onClick={() => c.setPage(Math.max(1, c.page - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    disabled={c.page === 1}
                    aria-label="Anterior"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>

                  {Array.from({ length: Math.min(c.totalPages, 5) }).map((_, i) => {
                    const start = Math.max(1, Math.min(c.page - 2, c.totalPages - 4));
                    const n = start + i;
                    const isActive = c.page === n;
                    return (
                      <button
                        key={n}
                        onClick={() => c.setPage(n)}
                        className={`mx-1 flex h-10 w-10 items-center justify-center rounded-md ${
                          isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}

                  {c.totalPages > 5 && c.page + 2 < c.totalPages && (
                    <>
                      <span className="mx-1 flex h-10 w-10 items-center justify-center text-gray-500">…</span>
                      <button
                        onClick={() => c.setPage(c.totalPages)}
                        className="mx-1 flex h-10 w-10 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
                      >
                        {c.totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => c.setPage(Math.min(c.totalPages, c.page + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                    disabled={c.page === c.totalPages}
                    aria-label="Próxima"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </nav>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
