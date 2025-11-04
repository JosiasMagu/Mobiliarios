import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/States/auth.store";
import { LogOut, LayoutGrid, Package, Users, ShoppingBag } from "lucide-react";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const auth = useAdminAuth();
  const loc = useLocation();

  if (!auth.token) {
    const back = encodeURIComponent(loc.pathname + loc.search + loc.hash);
    return <Navigate to={`/admin/login?back=${back}`} replace />;
  }

  const displayName = auth.user?.name ?? "Administrador";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 border-r border-slate-200 bg-white">
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center text-white font-bold">
            M
          </div>
          <div className="font-extrabold tracking-tight">Mobiliário • Admin</div>
        </div>
        <nav className="p-3 space-y-1 text-sm">
          <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50">
            <LayoutGrid className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/admin/produtos" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50">
            <Package className="w-4 h-4" /> Produtos
          </Link>
          <Link to="/admin/pedidos" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50">
            <ShoppingBag className="w-4 h-4" /> Pedidos
          </Link>
          <Link to="/admin/clientes" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50">
            <Users className="w-4 h-4" /> Clientes
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 mb-2 px-1">Conectado como</div>
          <div className="px-3 py-2 rounded-md bg-slate-50 border border-slate-200/60 text-sm mb-2">
            {displayName}
          </div>
          <button
            onClick={() => auth.signOut()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 py-2 text-sm"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Header */}
      <AdminHeader />

      {/* Main */}
      <main className="pl-60 p-6">{children}</main>
    </div>
  );
}
