// src/components/common/Footer.tsx
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/40 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        {/* Institucional */}
        <div>
          <div className="font-semibold mb-3">Institucional</div>
          <ul className="space-y-2 text-slate-600">
            <li>
              <Link to="/sobre" className="hover:text-slate-900">
                Sobre nós
              </Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-slate-900">
                Contato
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-slate-900">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Ajuda / Suporte */}
        <div>
          <div className="font-semibold mb-3">Ajuda</div>
          <ul className="space-y-2 text-slate-600">
            <li>
              <Link to="/cart" className="hover:text-slate-900">
                Carrinho
              </Link>
            </li>
            <li>
              <Link to="/checkout" className="hover:text-slate-900">
                Checkout
              </Link>
            </li>
            <li>
              <Link to="/account" className="hover:text-slate-900">
                Minha conta
              </Link>
            </li>
          </ul>
        </div>

        {/* Políticas */}
        <div>
          <div className="font-semibold mb-3">Políticas</div>
          <ul className="space-y-2 text-slate-600">
            <li>
              <Link to="/politicas" className="hover:text-slate-900">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link to="/politicas" className="hover:text-slate-900">
                Política de Devolução/Troca
              </Link>
            </li>
            <li>
              <Link to="/politicas" className="hover:text-slate-900">
                Termos e Condições
              </Link>
            </li>
          </ul>
        </div>

        {/* Contato direto / Social */}
        <div>
          <div className="font-semibold mb-3">Contato</div>
          <ul className="space-y-2 text-slate-600">
            <li>WhatsApp: +258 84 000 0000</li>
            <li>Email: suporte@mobicasa.co.mz</li>
            <li>Maputo · Moçambique</li>
          </ul>

          <div className="font-semibold mt-6 mb-3">Siga-nos</div>
          <ul className="space-y-2 text-slate-600">
            <li>
              <a href="#" className="hover:text-slate-900">
                Instagram
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-slate-900">
                Facebook
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-slate-900">
                TikTok
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pb-8">
        © {new Date().getFullYear()} Mobiliário · NUIT 123456789 · Todos os direitos reservados
      </div>
    </footer>
  );
}
