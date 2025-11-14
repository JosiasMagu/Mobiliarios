import type { FC } from "react";
import { X } from "lucide-react";
import { currency } from "@utils/currency";
import type { Address, Prefs } from "@repo/customer.repository";
import type { Order } from "@repo/order.repository";

type CustomerProfile = { id: string; name: string; email: string };
type CustomerRow = {
  profile: CustomerProfile;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: string;
};
type FullData = CustomerRow & { addresses: Address[]; prefs: Prefs; orders: Order[] };

type Props = {
  open: boolean;
  data: FullData | null;
  onClose: () => void;
};

const CustomerDetailDialog: FC<Props> = ({ open, data, onClose }) => {
  if (!open || !data) return null;

  const { profile, addresses, prefs, orders } = data;

  const totalDoCliente = orders.reduce((a: number, o: Order) => a + Number(o.total || 0), 0);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-3">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/60">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/60">
          <div className="font-bold">Perfil do Cliente</div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-50" title="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 grid gap-5">
          {/* dados básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg ring-1 ring-slate-200 p-3">
              <div className="text-xs text-slate-500">Nome</div>
              <div className="font-medium">{profile.name}</div>
              <div className="text-xs text-slate-500 mt-1">{profile.email}</div>
            </div>
            <div className="rounded-lg ring-1 ring-slate-200 p-3">
              <div className="text-xs text-slate-500">Preferências</div>
              <div className="font-medium">{prefs.marketing ? "Recebe marketing" : "Não recebe marketing"}</div>
            </div>
            <div className="rounded-lg ring-1 ring-slate-200 p-3">
              <div className="text-xs text-slate-500">Resumo</div>
              <div className="font-medium">{orders.length} pedidos</div>
              <div className="text-xs text-slate-500">
                Gasto total {currency(totalDoCliente)}
              </div>
            </div>
          </div>

          {/* endereços */}
          <div className="rounded-lg ring-1 ring-slate-200 p-3">
            <div className="text-sm font-medium mb-2">Endereços</div>
            {addresses.length === 0 ? (
              <div className="text-sm text-slate-500">Sem endereços cadastrados.</div>
            ) : (
              <ul className="text-sm grid gap-1">
                {addresses.map((a: Address) => (
                  <li key={a.id} className="flex items-center justify-between">
                    <span>
                      {a.street} — {a.city}
                      {a.state ? `, ${a.state}` : ""} {a.zip ? `(${a.zip})` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* histórico de pedidos */}
          <div className="rounded-lg ring-1 ring-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2">Pedido</th>
                  <th className="text-left px-4 py-2">Data</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-right px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Sem pedidos.
                    </td>
                  </tr>
                ) : (
                  orders.map((o: Order) => (
                    <tr key={o.id} className="border-t border-slate-200/60">
                      <td className="px-4 py-2">{o.number || `#${o.id}`}</td>
                      <td className="px-4 py-2">
                        {new Date(o.createdAt).toLocaleDateString("pt-MZ")}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${
                          o.status === "delivered"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : o.status === "paid"
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                            : o.status === "cancelled"
                            ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                            : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                        }`}
                        >
                          {o.status === "pending"
                            ? "Aguardando"
                            : o.status === "paid"
                            ? "Pago"
                            : o.status === "shipped"
                            ? "Enviado"
                            : o.status === "delivered"
                            ? "Entregue"
                            : "Cancelado"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">{currency(o.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-5 py-4 flex justify-end gap-2 border-t border-slate-200/60">
          <button
            onClick={onClose}
            className="rounded-md ring-1 ring-slate-200 px-3 py-2 text-sm bg-white hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailDialog;
