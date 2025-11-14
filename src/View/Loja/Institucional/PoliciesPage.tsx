// src/View/Loja/Institucional/PoliciesPage.tsx
import { Navbar } from "@comp/home/Navbar";
import { Footer } from "@comp/home/Footer";
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
      <Navbar
        sections={[]} active="" cartCount={cart.totalQty} wishlistCount={cart.wishlistCount}
        searchQuery="" setSearchQuery={() => {}} menuOpen={ui.menuOpen} setMenuOpen={setMenuOpenProp} smoothScrollTo={() => {}}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Políticas</h1>

        <Section id="privacidade" title="Política de Privacidade">
          Coletamos dados para processar pedidos e oferecer suporte. Não vendemos seus dados. Você pode solicitar acesso,
          correção ou exclusão pelo e-mail privacy@mobiliarte.co.mz. Cookies essenciais são usados para sessão e carrinho.
        </Section>

        <Section id="devolucao" title="Política de Devolução/Troca">
          Arrependimento em até 7 dias corridos após recebimento. Para defeito, 30 dias. Produto sem uso e com embalagem
          original. Abra solicitação pelo e-mail pedidos@mobicasa.co.mz informando nº do pedido.
        </Section>

        <Section id="termos" title="Termos e Condições">
          Preços em MZN e sujeitos a alteração. Disponibilidade vinculada ao estoque no momento da confirmação. O cliente
          é responsável por informar morada correta. Foro da sede da empresa.
        </Section>

        <Section id="seguranca" title="Segurança">
          Operamos com HTTPS, prevenção a ataques comuns, rate limiting de APIs e senhas com hash seguro.
          Não armazenamos dados sensíveis de cartão. Para carteiras móveis, guardamos somente referências de transação.
        </Section>

        <Section id="frete" title="Envio e Frete">
          Serviços: Retirar no local, Padrão (3–5 dias), Expresso (1–2 dias) e Por Zona. O valor é exibido no checkout
          conforme a regra ativa e a região informada.
        </Section>

        <Section id="pagamentos" title="Formas de Pagamento">
          Aceitamos M-Pesa e e-Mola. Em alguns casos, transferência bancária. Pagamentos por carteira podem levar até 24h
          para compensação. Guarde o comprovante.
        </Section>
      </main>

      <Footer />
    </div>
  );
}
