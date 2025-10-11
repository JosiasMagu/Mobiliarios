import { Navbar } from "@comp/home/Navbar";
import { Footer } from "@comp/layout/footer";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";

export default function PoliciesPage() {
  const cart = useCartStore(); const ui = useUIStore();
  const setMenuOpenProp = (v: boolean) => {
    const anyStore = ui as any; const isOpen = !!ui.menuOpen;
    if (typeof anyStore.setMenuOpen === "function") (anyStore.setMenuOpen.length ? anyStore.setMenuOpen(v) : anyStore.setMenuOpen());
    else if (typeof anyStore.toggleMenu === "function" && isOpen !== !!v) anyStore.toggleMenu();
  };

  const Section = ({ id, title, children }: any) => (
    <section id={id} className="rounded-xl border border-slate-200/40 bg-white p-6">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar sections={[]} active="" cartCount={cart.totalQty} wishlistCount={cart.wishlistCount}
        searchQuery="" setSearchQuery={() => {}} menuOpen={ui.menuOpen} setMenuOpen={setMenuOpenProp} smoothScrollTo={() => {}} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Políticas</h1>

        <Section id="privacidade" title="Política de Privacidade">
          Tratamos seus dados seguindo as melhores práticas de segurança. Usamos suas informações para
          processar pedidos, suporte e comunicações. Você pode solicitar a remoção dos seus dados a qualquer momento.
        </Section>

        <Section id="devolucao" title="Política de Devolução/Troca">
          Você pode solicitar devolução em até 7 dias corridos após o recebimento. Para trocas por defeito,
          o prazo é de 30 dias. Produtos devem estar em perfeitas condições e com embalagem original.
        </Section>

        <Section id="termos" title="Termos e Condições">
          Ao comprar, você concorda com nossos termos de uso, prazos de entrega, preços e formas de pagamento.
          Reservamo-nos o direito de corrigir erros de preço e descrição sem aviso prévio.
        </Section>
      </main>

      <Footer />
    </div>
  );
}
