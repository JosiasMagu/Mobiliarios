import { useEffect, useMemo, useState } from "react";
import OrderDetailDialog from "@/Components/admin/OrderDetailDialog";
import {
  listAllOrders,
  updateOrderStatus,
  addOrderNote,
  type Order,
  type OrderStatus,
} from "@repo/order.repository";
import { currency } from "@utils/currency";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter(o =>
      o.number?.toLowerCase().includes(term) ||
      o.customer?.name?.toLowerCase().includes(term) ||
      o.customer?.email?.toLowerCase().includes(term)
    );
  }, [orders, q]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await listAllOrders();
        if (alive) setOrders(data);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Falha ao carregar pedidos");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const onUpdateStatus = async (status: OrderStatus, note?: string) => {
    if (!selected) return;
    const upd = await updateOrderStatus(selected.id, status, note);
    setOrders(prev => prev.map(o => (o.id === upd.id ? upd : o)));
    setSelected(upd);
  };

  const onAddNote = async (note: string) => {
    if (!selected) return;
    const upd = await addOrderNote(selected.id, note);
    setOrders(prev => prev.map(o => (o.id === upd.id ? upd : o)));
    setSelected(upd);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Pedidos</h1>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Procurar por nº, cliente, e-mail"
          className="w-72 rounded-md ring-1 ring-slate-200 px-3 py-2 outline-none"
        />
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200/60 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">Pedido</th>
              <th className="text-left px-4 py-2">Cliente</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Total</th>
              <th className="text-left px-4 py-2">Criado em</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">A carregar…</td></tr>
            )}
            {error && !loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-red-600">{error}</td></tr>
            )}
            {!loading && !error && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Sem pedidos.</td></tr>
            )}
            {!loading && !error && filtered.map(o => (
              <tr key={o.id} className="border-t border-slate-200/60 hover:bg-slate-50">
                <td className="px-4 py-2 font-medium">{o.number || `#${o.id}`}</td>
                <td className="px-4 py-2">{o.customer?.name || o.customer?.email || "—"}</td>
                <td className="px-4 py-2">
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-slate-200">
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">{currency(o.total)}</td>
                <td className="px-4 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5"
                    onClick={() => setSelected(o)}
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monte o dialog APENAS quando houver pedido selecionado */}
      {selected && (
        <OrderDetailDialog
          open={true}
          order={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={onUpdateStatus}
          onAddNote={onAddNote}
        />
      )}
    </div>
  );
}
