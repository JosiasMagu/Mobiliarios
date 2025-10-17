import type { FC } from "react";
import type { CustomerRow } from "@state/customer.admin.sotre";
import { Search, Eye } from "lucide-react";
import { currency } from "@utils/currency";

type Props = {
  data: CustomerRow[];
  loading?: boolean;
  onOpen: (id: string) => void;
  onSearch: (q: string) => void;
};

const CustomerTable: FC<Props> = ({ data, loading, onOpen, onSearch }) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar por nome, email ou telefone"
          className="w-full rounded-xl ring-1 ring-slate-200 pl-9 pr-3 py-2 outline-none bg-white focus:ring-slate-400"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Pedidos</th>
              <th className="text-left px-4 py-3">Gasto total</th>
              <th className="text-left px-4 py-3">Último pedido</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">A carregar…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Sem clientes.</td></tr>
            ) : (
              data.map((r) => (
                <tr key={r.profile.id} className="border-t border-slate-200/60">
                  <td className="px-4 py-3">{r.profile.name}</td>
                  <td className="px-4 py-3">{r.profile.email}</td>
                  <td className="px-4 py-3">{r.ordersCount}</td>
                  <td className="px-4 py-3">{currency(r.totalSpent)}</td>
                  <td className="px-4 py-3">
                    {r.lastOrderAt ? new Date(r.lastOrderAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button className="icon-btn" title="Ver perfil" onClick={() => onOpen(r.profile.id)}>
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
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

export default CustomerTable;
