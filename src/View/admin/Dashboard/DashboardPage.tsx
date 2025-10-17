import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { listAllOrders } from "@repo/order.repository";
import { currency } from "@utils/currency";
import ProductsPage from "@view/admin/Products/ProductsPage";
import CategoriesPage from "@view/admin/Categories/CategoriesPage";
import OrdersPage from "@view/admin/Orders/OrdersPage";
import AdminHeader from "@comp/admin/AdminHeader";
import AdminSidebar from "@comp/admin/AdminSidebar";
import CustomersPage from "../Customers/CustomerPage";
import ReportPage from "../Reports/ReportPage";
import MarketingPage from "../Marketing/MarketingPage";
import PaymentsPage from "../PaymentShipping/PaymentsPage";

/* UI */
function StatCard({ title, value, delta }: { title: string; value: string; delta?: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
      {delta && <div className="text-xs text-emerald-600 mt-1">{delta}</div>}
    </div>
  );
}
function Sparkline({ points, height = 64 }: { points: number[]; height?: number }) {
  const width = 200;
  const max = Math.max(1, ...points);
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const d = points.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height - 6) - 3;
    return `${i === 0 ? "M" : "L"} ${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      <path d={d} fill="none" stroke="currentColor" className="text-blue-600" strokeWidth="2" />
    </svg>
  );
}
function MiniBars({ points, height = 64 }: { points: number[]; height?: number }) {
  const width = 200;
  const max = Math.max(1, ...points);
  const barW = Math.max(4, Math.floor(width / (points.length * 1.5)));
  const gap = Math.max(2, Math.floor(barW / 2));
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      {points.map((v, i) => {
        const h = Math.max(2, (v / max) * (height - 6));
        const x = i * (barW + gap);
        const y = height - h;
        return <rect key={i} x={x} y={y} width={barW} height={h} rx="2" className="fill-indigo-600/70" />;
      })}
    </svg>
  );
}

/* Home */
function DashboardHome() {
  const [orders, setOrders] = useState<ReturnType<typeof listAllOrders>[number][]>([]);
  const navigate = useNavigate();

  useEffect(() => { setOrders(listAllOrders()); }, []);

  const today = new Date();
  const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const { salesToday, salesWeek, salesMonth } = useMemo(() => {
    const sum = (from: Date) =>
      orders.filter(o => new Date(o.createdAt) >= from).reduce((a, o) => a + o.total, 0);
    return {
      salesToday: orders.filter(o => new Date(o.createdAt).toDateString() === today.toDateString()).reduce((a, o) => a + o.total, 0),
      salesWeek: sum(startOfWeek),
      salesMonth: sum(startOfMonth),
    };
  }, [orders]);

  const recent = useMemo(() => orders.slice(0, 5), [orders]);
  const bestSellers = useMemo(() => {
    const m = new Map<string, { name: string; qty: number }>();
    orders.forEach(o => o.items.forEach(it => {
      const k = String(it.productId);
      const prev = m.get(k) || { name: it.name, qty: 0 };
      prev.qty += it.qty; m.set(k, prev);
    }));
    return [...m.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Vendas Hoje" value={currency(salesToday)} delta="+10%" />
        <StatCard title="Vendas Esta Semana" value={currency(salesWeek)} delta="+5%" />
        <StatCard title="Vendas Este Mês" value={currency(salesMonth)} delta="+8%" />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
          <div className="font-bold mb-3">Ações Rápidas</div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2" onClick={()=>navigate("/admin/products")}>Adicionar Produto</button>
            <button className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold px-3 py-2" onClick={()=>navigate("/admin/categories")}>Gerir Categorias</button>
            <button className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold px-3 py-2" onClick={()=>navigate("/admin/orders")}>Gerir Pedidos</button>
            <button className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold px-3 py-2" onClick={()=>navigate("/admin/marketing")}>Marketing</button>
            <button className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold px-3 py-2" onClick={()=>navigate("/admin/payments")}>Pagamentos</button>
          </div>

          <div className="mt-6">
            <div className="font-bold mb-2">Pedidos Recentes</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2">Pedido</th><th>Cliente</th><th>Data</th><th>Status</th><th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(o=>(
                    <tr key={o.id} className="border-t border-slate-200/60">
                      <td className="py-2">{o.number || `#${o.id}`}</td>
                      <td>{o.customer.name || o.customer.email || (o.customer.guest ? "Convidado" : "-")}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                          {o.status === "pending" ? "Aguardando" :
                           o.status === "paid" ? "Pago" :
                           o.status === "shipped" ? "Enviado" :
                           o.status === "delivered" ? "Entregue" : "Cancelado"}
                        </span>
                      </td>
                      <td className="text-right font-semibold">{currency(o.total)}</td>
                    </tr>
                  ))}
                  {recent.length===0 && <tr><td colSpan={5} className="py-6 text-center text-slate-500">Sem pedidos ainda.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
            <div className="font-bold mb-2">Produtos Mais Vendidos</div>
            <ul className="text-sm space-y-2">
              {bestSellers.map((p,idx)=>(
                <li key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-slate-100 grid place-items-center text-[10px]">{idx+1}</div>
                    <span className="line-clamp-1 max-w-[180px]">{p.name}</span>
                  </div>
                  <span className="text-slate-500">{p.qty} un.</span>
                </li>
              ))}
              {bestSellers.length===0 && <li className="text-slate-500">Sem vendas ainda.</li>}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
            <div className="font-bold mb-2">Desempenho</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-28 rounded-md ring-1 ring-slate-200 p-2">
                <Sparkline points={Array.from({length:14},(_,i)=>i)} />
                <div className="mt-1 text-xs text-slate-500">Vendas últimos 14 dias</div>
              </div>
              <div className="h-28 rounded-md ring-1 ring-slate-200 p-2">
                <MiniBars points={Array.from({length:12},(_,i)=>i+2)} />
                <div className="mt-1 text-xs text-slate-500">Vendas últimas 12 semanas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Painéis internos simples para Marketing e Pagamentos */
function MarketingPanel() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 space-y-4">
      <div className="text-lg font-bold">Marketing</div>
      <ul className="text-sm list-disc pl-5 space-y-1">
        <li>Campanhas ativas e agendadas</li>
        <li>Cupons e descontos</li>
        <li>Captura de e-mails e consentimentos</li>
      </ul>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg ring-1 ring-slate-200 p-3">
          <div className="text-sm font-medium">Taxa de conversão</div>
          <div className="text-2xl font-extrabold mt-1">2,3%</div>
        </div>
        <div className="rounded-lg ring-1 ring-slate-200 p-3">
          <div className="text-sm font-medium">CTR campanhas</div>
          <div className="text-2xl font-extrabold mt-1">4,9%</div>
        </div>
      </div>
    </div>
  );
}
function PaymentsPanel() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 space-y-4">
      <div className="text-lg font-bold">Pagamentos</div>
      <ul className="text-sm list-disc pl-5 space-y-1">
        <li>Métodos: Cartão, Boleto, Transferência, PIX</li>
        <li>Taxas de aprovação e chargebacks</li>
        <li>Conciliação de pedidos pagos</li>
      </ul>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-lg ring-1 ring-slate-200 p-3">
          <div className="text-sm font-medium">Aprovação</div>
          <div className="text-2xl font-extrabold mt-1">91%</div>
        </div>
        <div className="rounded-lg ring-1 ring-slate-200 p-3">
          <div className="text-sm font-medium">Pendentes</div>
          <div className="text-2xl font-extrabold mt-1">7</div>
        </div>
        <div className="rounded-lg ring-1 ring-slate-200 p-3">
          <div className="text-sm font-medium">Chargebacks</div>
          <div className="text-2xl font-extrabold mt-1">0</div>
        </div>
      </div>
    </div>
  );
}

/* Shell */
export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader />
      <AdminSidebar />
      <main className="pl-60 pt-16 h-screen overflow-hidden">
        <div className="h-[calc(100vh-64px)] overflow-y-auto p-4 lg:p-6" style={{ scrollBehavior: "smooth" }}>
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="customers" element={<CustomersPage/>} />
            <Route path="reports" element={<ReportPage/>} />
            <Route path="marketing" element={<MarketingPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route
              path="settings"
              element={<div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">Em breve: Configurações</div>}
            />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
