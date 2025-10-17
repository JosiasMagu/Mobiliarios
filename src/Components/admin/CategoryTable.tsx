import type { FC } from "react";
import type { Category } from "@model/category.model";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";

type Props = {
  data: Category[];
  parents: Category[];
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
  onReorder: (pairs: Array<{ id: string; position: number }>) => void;
};

const CategoryTable: FC<Props> = ({ data, parents, onEdit, onDelete, onReorder }) => {
  function parentName(pid?: string | null) {
    if (pid == null) return "-";
    const p = parents.find(x => String(x.id) === String(pid));
    return p?.name || "-";
  }

  function move(id: string, dir: -1 | 1) {
    const idx = data.findIndex(c => String(c.id) === String(id));
    if (idx < 0) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= data.length) return;
    const a = data[idx], b = data[swapIdx];
    onReorder([
      { id: String(a.id), position: b.position },
      { id: String(b.id), position: a.position },
    ]);
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left px-4 py-3">Nome</th>
            <th className="text-left px-4 py-3">Pai</th>
            <th className="text-left px-4 py-3">Ícone</th>
            <th className="text-left px-4 py-3">Posição</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => (
            <tr key={String(c.id)} className="border-t border-slate-200/60">
              <td className="px-4 py-3">{c.name}</td>
              <td className="px-4 py-3">{parentName(c.parentId as any)}</td>
              <td className="px-4 py-3">{c.icon ? c.icon : "-"}</td>
              <td className="px-4 py-3">{c.position}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.isActive
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                  }`}
                >
                  {c.isActive ? "Ativa" : "Inativa"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    className="icon-btn"
                    title="Mover"
                    onClick={() => move(String(c.id), i % 2 === 0 ? 1 : -1)}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                  <button
                    className="icon-btn"
                    title="Editar"
                    onClick={() => onEdit(c)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="icon-btn text-rose-600 hover:bg-rose-50"
                    title="Excluir"
                    onClick={() => onDelete(String(c.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                Sem categorias.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <style>{`
        .icon-btn{padding:.45rem;border-radius:.5rem;border:1px solid #e2e8f0;background:white}
        .icon-btn:hover{background:#f8fafc}
      `}</style>
    </div>
  );
};

export default CategoryTable;
