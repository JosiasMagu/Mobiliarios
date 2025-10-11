import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">© {new Date().getFullYear()} Mobiliário. Todos os direitos reservados.</div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link className="text-slate-600 hover:text-slate-900" to="/sobre">Sobre Nós</Link>
          <Link className="text-slate-600 hover:text-slate-900" to="/contato">Contato</Link>
          <Link className="text-slate-600 hover:text-slate-900" to="/faq">FAQ</Link>
          <Link className="text-slate-600 hover:text-slate-900" to="/politicas">Políticas</Link>
        </nav>
      </div>
    </footer>
  );
}
