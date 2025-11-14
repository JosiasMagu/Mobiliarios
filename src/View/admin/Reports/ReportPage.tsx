import { useEffect, useMemo, useState } from "react";
import {
  salesByPeriod,
  topSellingProducts,
  customerReport,
  stockReport,
  lastNDays,
  thisMonth,
  // Caso seu util exporte tipos, prefira importá-los.
  // Ex.: SalesBucket, TopProduct, CustomerReport, StockRow
} from "@utils/reporting";
import { currency } from "@utils/currency";

/** Tipos mínimos locais para evitar 'implicit any' se @utils/reporting não exportar */
type SalesBucket = { label: string; total: number };
type TopProduct = { name: string; qty: number; revenue: number };
type CustomerReport = { newCustomers: number; returningCustomers: number; totalCustomers: number };
type StockRow = { id: number; name: string; inStock: boolean; stockQty?: number };

/* Pequenos componentes visuais */
function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}

function Sparkline({ points, height = 64 }: { points: number[]; height?: number }) {
  const width = 240;
  const safePoints = points.length ? points : [0];
  const max = Math.max(1, ...safePoints);
  const step = safePoints.length > 1 ? width / (safePoints.length - 1) : width;
  const d = safePoints
    .map((v, i) => {
      const x = i * step;
      const y = height - (v / max) * (height - 6) - 3;
      return `${i === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      <path d={d} fill="none" stroke="currentColor" className="text-blue-600" strokeWidth="2" />
    </svg>
  );
}

export default function ReportPage() {
  // períodos
  const [period, setPeriod] = useState<"7d" | "30d" | "month">("7d");

  // dados
  const [salesPoints, setSalesPoints] = useState<SalesBucket[]>([]);
  const [tops, setTops] = useState<TopProduct[]>([]);
  const [cust, setCust] = useState<CustomerReport | null>(null);
  const [stock, setStock] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(false);

  // carregar
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const p = period === "7d" ? lastNDays(7) : period === "30d" ? lastNDays(30) : thisMonth();

        // vendas
        const buckets = await salesByPeriod(p, "day"); // Promise<SalesBucket[]>
        if (alive) setSalesPoints(buckets.map((b: SalesBucket) => ({ label: b.label, total: b.total })));

        // top produtos
        const topData = await topSellingProducts(p, 8); // Promise<TopProduct[]>
        if (alive)
          setTops(
            topData.map((t: TopProduct) => ({ name: t.name, qty: t.qty, revenue: t.revenue }))
          );

        // clientes
        const cr = await customerReport(p); // Promise<CustomerReport>
        if (alive) setCust(cr);

        // estoque
        const st = await stockReport(); // Promise<StockRow[]>
        if (alive) setStock(st);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [period]);

  const totals = useMemo(() => {
    const sum = salesPoints.reduce((acc, item) => acc + item.total, 0);
    return { sum, avg: salesPoints.length ? sum / salesPoints.length : 0 };
  }, [salesPoints]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xl font-extrabold">Relatórios</div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1.5 text-sm rounded-md ring-1 ${
              period === "7d" ? "bg-blue-600 text-white ring-blue-600" : "ring-slate-200 bg-white hover:bg-slate-50"
            }`}
            onClick={() => setPeriod("7d")}
          >
            7 dias
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md ring-1 ${
              period === "30d" ? "bg-blue-600 text-white ring-blue-600" : "ring-slate-200 bg-white hover:bg-slate-50"
            }`}
            onClick={() => setPeriod("30d")}
          >
            30 dias
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md ring-1 ${
              period === "month" ? "bg-blue-600 text-white ring-blue-600" : "ring-slate-200 bg-white hover:bg-slate-50"
            }`}
            onClick={() => setPeriod("month")}
          >
            Este mês
          </button>
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Kpi title="Vendas no período" value={currency(totals.sum)} />
        <Kpi title="Ticket médio diário" value={currency(totals.avg)} hint="Soma diária / nº de dias" />
        <Kpi
          title="Clientes (novos x recorrentes)"
          value={cust ? `${cust.newCustomers} x ${cust.returningCustomers}` : "—"}
        />
      </div>

      {/* Gráfico simples de vendas */}
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
        <div className="font-bold mb-2">Vendas por dia {loading && <span className="text-xs text-slate-500">(a carregar)</span>}</div>
        <Sparkline points={salesPoints.map((p) => p.total)} />
        <div className="mt-2 grid grid-cols-2 text-xs text-slate-500">
          <span>Primeiro dia: {salesPoints[0]?.label ?? "-"}</span>
          <span className="text-right">
            Último dia: {salesPoints.length ? salesPoints[salesPoints.length - 1]?.label : "-"}
          </span>
        </div>
      </section>

      {/* Top produtos e estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
          <div className="font-bold mb-2">Produtos mais vendidos</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2">Produto</th>
                  <th className="text-left px-4 py-2">Qtd</th>
                  <th className="text-right px-4 py-2">Receita</th>
                </tr>
              </thead>
              <tbody>
                {tops.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                      {loading ? "A carregar…" : "Sem dados."}
                    </td>
                  </tr>
                ) : (
                  tops.map((t, i) => (
                    <tr key={`${t.name}-${i}`} className="border-t border-slate-200/60">
                      <td className="px-4 py-2">{t.name}</td>
                      <td className="px-4 py-2">{t.qty}</td>
                      <td className="px-4 py-2 text-right">{currency(t.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
          <div className="font-bold mb-2">Relatório de estoque</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2">Produto</th>
                  <th className="text-left px-4 py-2">Disponível</th>
                  <th className="text-left px-4 py-2">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {stock.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                      {loading ? "A carregar…" : "Sem dados."}
                    </td>
                  </tr>
                ) : (
                  stock.map((s) => (
                    <tr key={s.id} className="border-t border-slate-200/60">
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            s.inStock
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                              : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                          }`}
                        >
                          {s.inStock ? "Em estoque" : "Indisponível"}
                        </span>
                      </td>
                      <td className="px-4 py-2">{s.stockQty ?? "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
