import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useAdminCategories } from "@state/category.admin.store";
import type { Category } from "@model/category.model";
import CategoryTable from "@comp/admin/CategoryTable";
import CategoryFormDialog from "@comp/admin/CategoryFormDialog";

export default function CategoriesPage() {
  const cat = useAdminCategories();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => { cat.fetch(); }, []);

  const parents = useMemo(() => cat.items.filter(c => !c.parentId), [cat.items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cat.items;
    return cat.items.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.slug?.toLowerCase().includes(q)));
  }, [cat.items, query]);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(c: Category) {
    setEditing(c);
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-extrabold">Gestão de Categorias</div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Adicionar Categoria
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar categorias"
          className="w-full rounded-xl ring-1 ring-slate-200 pl-9 pr-3 py-2 outline-none bg-white focus:ring-slate-400"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <CategoryTable
        data={filtered}
        parents={parents}
        onEdit={openEdit}
        onDelete={(id) => cat.remove(id)}
        onReorder={(pairs) => cat.reorder(pairs)}
      />

      <CategoryFormDialog
        open={open}
        onClose={() => setOpen(false)}
        value={editing}
        parents={parents}
        onSubmit={async (payload) => {
          await cat.createOrUpdate(payload);
          setOpen(false);
        }}
      />
    </div>
  );
}
