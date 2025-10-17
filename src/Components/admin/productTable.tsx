import type { FC } from "react";
import type { Product } from "@/Model/product.model";
import { Pencil, Trash2, Copy, Search } from "lucide-react";
import { currency } from "@/Utils/currency";

type Props = {
  data: Product[];
  loading?: boolean;
  onEdit: (p: Product) => void;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onSearch: (s: string) => void;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
};

const ProductTable: FC<Props> = ({
  data,
  loading,
  onEdit,
  onDelete,
  onDuplicate,
  onSearch,
  total,
  page,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar produtos"
          className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 outline-none bg-white focus:border-slate-400"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* container com bordas suaves e linhas leves */}
      <div className="rounded-2xl ring-1 ring-slate-200/60 overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/70 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">Categoria</th>
              <th className="text-left px-4 py-3 font-medium">Preço</th>
              <th className="text-left px-4 py-3 font-medium">Estoque</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  A carregar…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Sem produtos.
                </td>
              </tr>
            ) : (
              data.map((p) => {
                const status = p.status ?? (p.inStock ? "published" : "draft");
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.categoryName ?? p.categorySlug ?? "-"}</td>
                    <td className="px-4 py-3">{currency(p.price)}</td>
                    <td className="px-4 py-3">{p.stockQty ?? (p.inStock ? 10 : 0)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          status === "published"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                        }`}
                      >
                        {status === "published" ? "Ativo" : "Rascunho"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="icon-btn" title="Editar" onClick={() => onEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="icon-btn" title="Duplicar" onClick={() => onDuplicate(p.id)}>
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          className="icon-btn text-rose-600 hover:bg-rose-50"
                          title="Excluir"
                          onClick={() => onDelete(p.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <span className="text-slate-600">Total: {total}</span>
        <div className="flex items-center gap-2">
          <button className="pg-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Anterior
          </button>
          <span className="text-slate-600">
            Página {page} de {Math.max(1, totalPages)}
          </span>
          <button className="pg-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Próxima
          </button>
        </div>
      </div>

      <style>{`
        .icon-btn{padding:.42rem;border-radius:.55rem;border:1px solid #e5e7eb;background:white}
        .icon-btn:hover{background:#f8fafc}
        .pg-btn{padding:.45rem .9rem;border-radius:.7rem;border:1px solid #e5e7eb;background:white}
        .pg-btn:disabled{opacity:.5}
        .pg-btn:hover:not(:disabled){background:#f8fafc}
      `}</style>
    </div>
  );
};

export default ProductTable;
