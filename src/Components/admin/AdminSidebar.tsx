import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, Receipt, Users, BarChart3, Settings, FolderTree,
  Megaphone, CreditCard
} from "lucide-react";

type ItemProps = { to: string; icon: any; label: string };

function normalize(path: string) {
  if (!path) return "/";
  return path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
}

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const current = normalize(pathname);

  const isActive = (target: string) => {
    const t = normalize(target);
    if (t === "/admin") return current === "/admin";
    return current === t || current.startsWith(t + "/");
  };

  const Item = ({ to, icon: Icon, label }: ItemProps) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition
          ${active ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"}`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    );
  };

  return (
    <aside
      className="fixed left-0 top-16 h-[calc(100vh-64px)] w-60
                 bg-white overflow-y-auto border-r border-slate-200/60 p-3"
      style={{ scrollBehavior: "smooth" }}
    >
      <nav className="mt-1 grid gap-1">
        <Item to="/admin" icon={LayoutDashboard} label="Dashboard" />
        <Item to="/admin/products" icon={Package} label="Produtos" />
        <Item to="/admin/categories" icon={FolderTree} label="Categorias" />
        <Item to="/admin/orders" icon={Receipt} label="Pedidos" />
        <Item to="/admin/customers" icon={Users} label="Clientes" />
        <Item to="/admin/reports" icon={BarChart3} label="Relatórios" />
        <Item to="/admin/marketing" icon={Megaphone} label="Marketing" />
        <Item to="/admin/payments" icon={CreditCard} label="Pagamentos" />
      </nav>

      <div className="mt-5">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />
        <Link
          to="/admin/settings"
          className="mt-3 flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50"
        >
          <Settings className="h-4 w-4" />
          Configurações
        </Link>
      </div>
    </aside>
  );
}
