import type { FC } from "react";
import type { Coupon } from "@repo/marketing.repository";

type Props = {
  data: Coupon[];
  onEdit: (c: Coupon) => void;
  onDelete: (id: string) => void;
};

// função auxiliar: converte strings/decimals para number seguro
function toNumber(v: unknown, def = 0): number {
  if (v == null) return def;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

const CouponTable: FC<Props> = ({ data, onEdit, onDelete }) => {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="font-bold mb-3">Cupons de Desconto</div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-600 bg-slate-50">
            <tr>
              <th className="text-left px-3 py-2">Código</th>
              <th className="text-left px-3 py-2">Tipo</th>
              <th className="text-left px-3 py-2">Valor</th>
              <th className="text-left px-3 py-2">Mín. Pedido</th>
              <th className="text-left px-3 py-2">Usos</th>
              <th className="text-left px-3 py-2">Expira</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-right px-3 py-2">Ações</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center text-slate-500"
                >
                  Sem cupons cadastrados.
                </td>
              </tr>
            )}

            {data.map((c) => {
              const isPercent = c.type === "PERCENT";
              const value = toNumber(c.value);
              const minOrder = c.minOrder ? toNumber(c.minOrder) : null;
              const expires =
                c.expiresAt != null
                  ? new Date(c.expiresAt as any).toLocaleDateString()
                  : "-";

              return (
                <tr
                  key={c.id}
                  className="border-t border-slate-200/60 hover:bg-slate-50/60"
                >
                  <td className="px-3 py-2 font-mono">{c.code}</td>

                  <td className="px-3 py-2">
                    {isPercent ? "Percentual" : "Fixo"}
                  </td>

                  <td className="px-3 py-2">
                    {isPercent
                      ? `${value}%`
                      : `MZN ${value.toFixed(2)}`}
                  </td>

                  <td className="px-3 py-2">
                    {minOrder != null
                      ? `MZN ${minOrder.toFixed(2)}`
                      : "-"}
                  </td>

                  <td className="px-3 py-2">
                    {(c.used ?? 0)}/{c.maxUses ?? "∞"}
                  </td>

                  <td className="px-3 py-2">{expires}</td>

                  <td className="px-3 py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ring-1 ${
                        c.active
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                          : "bg-slate-100 text-slate-700 ring-slate-200"
                      }`}
                    >
                      {c.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>

                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => onEdit(c)}
                        className="px-2 py-1 rounded-md ring-1 ring-slate-200 text-xs hover:bg-slate-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(c.id as any)}
                        className="px-2 py-1 rounded-md ring-1 ring-rose-200 text-xs text-rose-700 hover:bg-rose-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponTable;
