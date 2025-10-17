import type { FC } from "react";
import type { Order as RepoOrder } from "@repo/order.repository";
import { Eye } from "lucide-react";
import { currency } from "@utils/currency";

type Props = {
  data: RepoOrder[];
  loading?: boolean;
  onOpen: (id: string) => void;
};

const statusChip: Record<RepoOrder["status"], string> = {
  pending:   "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  paid:      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  shipped:   "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  delivered: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  cancelled: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
};

const OrderTable: FC<Props> = ({ data, loading, onOpen }) => {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 sticky top-0">
            <tr>
              <th className="text-left px-4 py-3">Pedido</th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Data</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">A carregar…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Sem pedidos.</td></tr>
            ) : data.map(o => (
              <tr key={o.id} className="border-t border-slate-200/60">
                <td className="px-4 py-3">{o.number}</td>
                <td className="px-4 py-3">{o.customer.name || o.customer.email || "Convidado"}</td>
                <td className="px-4 py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusChip[o.status]}`}>
                    {
                      o.status === "pending"   ? "Aguardando" :
                      o.status === "paid"      ? "Pago" :
                      o.status === "shipped"   ? "Enviado" :
                      o.status === "delivered" ? "Entregue" : "Cancelado"
                    }
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">{currency(o.total)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end">
                    <button className="icon-btn" title="Ver detalhes" onClick={() => onOpen(String(o.id))}>
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .icon-btn{padding:.45rem;border-radius:.5rem;border:1px solid #e2e8f0;background:white}
        .icon-btn:hover{background:#f8fafc}
      `}</style>
    </div>
  );
};

export default OrderTable;
