import { Navbar } from "@comp/home/Navbar";
import { Footer } from "@comp/layout/footer";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";
import { faqs } from "@repo/faq.repository";
import { AccordionItem } from "@comp/common/Accordion";

export default function FAQPage() {
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Perguntas Frequentes</h1>
        <div className="mt-6 grid gap-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} title={f.q}>{f.a}</AccordionItem>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
