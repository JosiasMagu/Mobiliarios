import { Navbar } from "@comp/home/Navbar";
import { Footer } from "@comp/layout/footer";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";

export default function AboutPage() {
  const cart = useCartStore(); const ui = useUIStore();
  const setMenuOpenProp = (v: boolean) => {
    const anyStore = ui as any; const isOpen = !!ui.menuOpen;
    if (typeof anyStore.setMenuOpen === "function") (anyStore.setMenuOpen.length ? anyStore.setMenuOpen(v) : anyStore.setMenuOpen());
    else if (typeof anyStore.toggleMenu === "function" && isOpen !== !!v) anyStore.toggleMenu();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar sections={[]} active="" cartCount={cart.totalQty} wishlistCount={cart.wishlistCount}
        searchQuery="" setSearchQuery={() => {}} menuOpen={ui.menuOpen} setMenuOpen={setMenuOpenProp} smoothScrollTo={() => {}} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sobre Nós</h1>
        <div className="mt-6 rounded-xl border border-slate-200/40 bg-white p-6 leading-relaxed text-slate-700">
          Na Mobiliário, acreditamos que cada ambiente deve refletir seu estilo.
          Desde 2015, unimos qualidade, conforto e durabilidade em peças selecionadas.
          Nossa equipa acompanha do primeiro contacto ao pós-venda, com consultoria e suporte.
          Explore o catálogo e descubra como transformar o seu espaço.
        </div>
      </main>

      <Footer />
    </div>
  );
}
