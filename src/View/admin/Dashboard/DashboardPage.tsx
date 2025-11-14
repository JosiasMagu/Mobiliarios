// admin/dashboardPage.tsx
import { useEffect, useMemo, useState } from "react";
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

/* ---------- UI ---------- */
function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
      {label}
    </span>
  );
}

/* ---------- Tipos ---------- */
type Metrics = {
  products: number;
  orders: number;
  revenueMonth: number;
  lowStock: number;
  activeCoupons: number;
  scheduledCampaigns: number;
  sentCampaigns: number;
};

function DashboardHome() {
  const { token, authHeader } = useAdminAuth();
  const [m, setM] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  // Base URL resiliente:
  const BASE = useMemo(() => {
    const env = String(import.meta.env.VITE_API_URL || "").trim();
    if (env) return env.replace(/\/+$/, "");
    // fallback para localhost: tenta mesma origem mas com :8080
    const host = window.location.hostname || "localhost";
    const port = String(import.meta.env.VITE_API_PORT || "8080");
    return `${window.location.protocol}//${host}:${port}`;
  }, []);
  const headers: HeadersInit = authHeader() ?? {};

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${BASE}/api/admin/metrics`, { headers });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as Metrics;
      setM(data);
    } catch (e: any) {
      setErr(e?.message || "Falha ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token, BASE]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Produtos" value={m ? String(m.products) : loading ? "…" : "0"} />
        <StatCard title="Pedidos" value={m ? String(m.orders) : loading ? "…" : "0"} />
        <StatCard title="Vendas este mês" value={m ? currency(m.revenueMonth) : currency(0)} hint="+0%" />
        <StatCard title="Baixo stock" value={m ? String(m.lowStock) : "…"} hint="≤ 2 unidades" />
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
        <div className="text-sm text-slate-500 mb-2">Resumo rápido</div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip label={`Cupons ativos: ${m ? m.activeCoupons : "…"}`} />
          <Chip label={`Campanhas agendadas: ${m ? m.scheduledCampaigns : "…"}`} />
          <Chip label={`Campanhas enviadas: ${m ? m.sentCampaigns : "…"}`} />
        </div>
      </div>

      {err && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 text-sm">
          <span>{err}</span>
          <button onClick={load} className="text-rose-700 underline">tentar novamente</button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2" onClick={() => navigate("/admin/products")}>Adicionar Produto</button>
        <button className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold px-3 py-2" onClick={() => navigate("/admin/categories")}>Gerir Categorias</button>
        <button className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold px-3 py-2" onClick={() => navigate("/admin/orders")}>Gerir Pedidos</button>
        <button className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold px-3 py-2" onClick={() => navigate("/admin/marketing")}>Marketing</button>
        <button className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold px-3 py-2" onClick={() => navigate("/admin/payments")}>Pagamentos</button>
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
            <Route path="customers" element={<CustomersPage />} />
            <Route path="reports" element={<ReportPage />} />
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
