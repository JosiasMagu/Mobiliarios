import type { FC } from "react";
import { X } from "lucide-react";
import { currency } from "@utils/currency";
import type {
  Order as RepoOrder,
  OrderStatus,
  PaymentKind,
  OrderAddress,
} from "@repo/order.repository";

type Props = {
  open: boolean;
  order?: RepoOrder | null;
  onClose: () => void;
  onUpdateStatus: (status: OrderStatus, note?: string) => void;
  onAddNote: (note: string) => void;
};

const statuses: { value: OrderStatus; label: string }[] = [
  { value: "pending",   label: "Aguardando pagamento" },
  { value: "paid",      label: "Pago" },
  { value: "shipped",   label: "Enviado" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
];

// Mapa “solto” para não travar em PaymentKind estrito
const labels: Record<string, string> = {
  mpesa: "M-Pesa",
  emola: "e-Mola",
  cash: "Dinheiro",
  card: "Cartão",
};

function addrLine1(a: OrderAddress | undefined): string {
  if (!a) return "";
  // Prioriza modelo “loja”
  const loja = [(a as any).bairro, (a as any).cidade, (a as any).provincia].filter(Boolean).join(", ");
  // Fallback para modelo “legado”
  const legado = [a.street].filter(Boolean).join("");
  return loja || legado || "";
}
function addrLine2(a: OrderAddress | undefined): string {
  if (!a) return "";
  const loja = [(a as any).referencia].filter(Boolean).join("");
  const legado = [a.state, a.zip].filter(Boolean).join(" ");
  return loja || legado || "";
}

const OrderDetailDialog: FC<Props> = ({ open, order, onClose, onUpdateStatus, onAddNote }) => {
  if (!open || !order) return null;

  const oany = order as any;
  const pm = oany.payment?.method ?? "card";
  const history = oany.history ?? [];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-3">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/60 flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/60">
          <div className="font-bold">Pedido {oany.number || `#${oany.id}`}</div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-50" title="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* body com scroll */}
        <div className="p-5 grid gap-5 overflow-y-auto">
          {/* resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg ring-1 ring-slate-200 p-3">
              <div className="text-xs text-slate-500">Cliente</div>
              <div className="font-medium">
                {oany.customer?.name || oany.customer?.email || (oany.customer?.guest ? "Convidado" : "-")}
              </div>
              <div className="text-xs text-slate-500">{oany.customer?.email || ""}</div>
            </div>
            <div className="rounded-lg ring-1 ring-slate-200 p-3">
              <div className="text-xs text-slate-500">Entrega</div>
              <div className="font-medium truncate">{addrLine1(oany.address)}</div>
              <div className="text-xs text-slate-500 truncate">{addrLine2(oany.address)}</div>
            </div>
            <div className="rounded-lg ring-1 ring-slate-200 p-3">
              <div className="text-xs text-slate-500">Pagamento</div>
              <div className="font-medium">{labels[String(pm)] ?? String(pm).toUpperCase()}</div>
              <div className="text-xs text-slate-500">Criado em {new Date(oany.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* itens */}
          <div className="rounded-lg ring-1 ring-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2">Produto</th>
                  <th className="text-left px-4 py-2">Qtd</th>
                  <th className="text-right px-4 py-2">Preço</th>
                  <th className="text-right px-4 py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {oany.items.map((it: any, i: number) => (
                  <tr key={i} className="border-t border-slate-200/60">
                    <td className="px-4 py-2">{it.name}</td>
                    <td className="px-4 py-2">{it.qty}</td>
                    <td className="px-4 py-2 text-right">{currency(it.price)}</td>
                    <td className="px-4 py-2 text-right">{currency(it.qty * it.price)}</td>
                  </tr>
                ))}
                <tr className="border-t border-slate-200/60">
                  <td colSpan={3} className="px-4 py-2 text-right font-semibold">Total</td>
                  <td className="px-4 py-2 text-right font-semibold">{currency(oany.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* status + nota */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg ring-1 ring-slate-200 p-3">
              <div className="text-sm font-medium mb-2">Atualizar Status</div>
              <select
                defaultValue={oany.status}
                onChange={(e) => onUpdateStatus(e.target.value as OrderStatus)}
                className="w-full rounded-md ring-1 ring-slate-200 bg-white px-3 py-2 outline-none"
              >
                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 rounded-lg ring-1 ring-slate-200 p-3">
              <div className="text-sm font-medium mb-2">Adicionar nota</div>
              <div className="flex gap-2">
                <input
                  id="order-note-input"
                  className="flex-1 rounded-md ring-1 ring-slate-200 px-3 py-2 outline-none"
                  placeholder="Observação do pedido"
                />
                <button
                  className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2"
                  onClick={() => {
                    const el = document.getElementById("order-note-input") as HTMLInputElement | null;
                    const v = el?.value?.trim(); if (!v) return;
                    onAddNote(v); if (el) el.value = "";
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>

          {/* histórico */}
          <div className="rounded-lg ring-1 ring-slate-200 p-3">
            <div className="text-sm font-medium mb-2">Histórico</div>
            <ul className="text-sm space-y-1">
              {(history ?? []).slice().reverse().map((h: any, i: number) => (
                <li key={i} className="flex items-center justify-between">
                  <span>
                    <span className="font-medium">
                      {h.status === "pending" ? "Aguardando" :
                       h.status === "paid" ? "Pago" :
                       h.status === "shipped" ? "Enviado" :
                       h.status === "delivered" ? "Entregue" : "Cancelado"}
                    </span>
                    {h.note ? ` — ${h.note}` : ""}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(h.at).toLocaleString()}</span>
                </li>
              ))}
              {(history ?? []).length === 0 && <li className="text-slate-500">Sem movimentações ainda.</li>}
            </ul>
          </div>
        </div>

        {/* footer */}
        <div className="px-5 py-4 flex justify-end gap-2 border-t border-slate-200/60">
          <button onClick={onClose} className="rounded-md ring-1 ring-slate-200 px-3 py-2 text-sm bg-white hover:bg-slate-50">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailDialog;
