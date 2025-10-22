// admin/dashboardPage.tsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { currency } from "@/Utils/currency";
import ProductsPage from "@/View/admin/Products/ProductsPage";
import CategoriesPage from "@/View/admin/Categories/CategoriesPage";
import OrdersPage from "@/View/admin/Orders/OrdersPage";
import AdminHeader from "@/Components/admin/AdminHeader";
import AdminSidebar from "@/Components/admin/AdminSidebar";
import CustomersPage from "@/View/admin/Customers/CustomerPage";
import ReportPage from "@/View/admin/Reports/ReportPage";
import MarketingPage from "@/View/admin/Marketing/MarketingPage";
import PaymentsPage from "@/View/admin/PaymentShipping/PaymentsPage";
import { useAdminAuth } from "@/States/auth.store";

function StatCard({ title, value, delta }: { title: string; value: string; delta?: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
      {delta && <div className="text-xs text-emerald-600 mt-1">{delta}</div>}
    </div>
  );
}

function DashboardHome() {
  const { token, authHeader } = useAdminAuth();
  const [metrics, setMetrics] = useState<{ products: number; orders: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/,'') || "http://localhost:8080";
    const headers: HeadersInit = authHeader() ?? {}; // <- fixa o tipo
    setLoading(true);
    fetch(`${BASE}/api/admin/metrics`, { headers })
      .then(async (r) => {
        if (!r.ok) {
          let msg = `HTTP ${r.status}`;
          try { const j = await r.json(); msg = j?.error || j?.message || msg; } catch {}
          throw new Error(msg);
        }
        return r.json();
      })
      .then(setMetrics)
      .catch((e:any)=> setErr(e?.message || "Falha ao carregar métricas"))
      .finally(()=> setLoading(false));
  }, [token]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Produtos" value={metrics ? String(metrics.products) : (loading ? "…" : "0")} />
        <StatCard title="Pedidos" value={metrics ? String(metrics.orders) : (loading ? "…" : "0")} />
        <StatCard title="Vendas Este Mês" value={currency(0)} delta="+0%" />
      </div>

      {err && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 text-sm">{err}</div>}

      <div className="mt-6 flex flex-wrap gap-2">
        <button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2" onClick={()=>navigate("/admin/products")}>Adicionar Produto</button>
        <button className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold px-3 py-2" onClick={()=>navigate("/admin/categories")}>Gerir Categorias</button>
        <button className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold px-3 py-2" onClick={()=>navigate("/admin/orders")}>Gerir Pedidos</button>
        <button className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold px-3 py-2" onClick={()=>navigate("/admin/marketing")}>Marketing</button>
        <button className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold px-3 py-2" onClick={()=>navigate("/admin/payments")}>Pagamentos</button>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  const { isAdmin } = useAdminAuth();
  if (!isAdmin()) return <Navigate to="/admin/login" replace />;
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader />
      <AdminSidebar />
      <main className="pl-60 pt-16 h-screen overflow-hidden">
        <div className="h-[calc(100vh-64px)] overflow-y-auto p-4 lg:p-6">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="customers" element={<CustomersPage/>} />
            <Route path="reports" element={<ReportPage/>} />
            <Route path="marketing" element={<MarketingPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="settings" element={<div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">Em breve</div>} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
