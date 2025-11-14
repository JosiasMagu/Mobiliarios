// src/pages/ProductPage.tsx
import { useEffect } from "react";
import { Plus } from "lucide-react";
import ProductTable from "@/Components/admin/productTable";
import { ProductFormDialog } from "@/Components/admin/productFormDialog";
import { useAdminProducts } from "@/States/product.admin.store";

export default function ProductsPage() {
  const {
    list,
    total,
    query,
    loading,
    dialog,
    error,
    fetch,
    setSearch,
    setPage,
    openCreate,
    openEdit,
    closeDialog,
    add,
    update,
    remove,
    duplicate,
  } = useAdminProducts();

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Gestão de Produtos</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white"
        >
          <Plus className="h-4 w-4" /> Adicionar Produto
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ProductTable
        data={list}
        loading={loading}
        onEdit={openEdit}
        onDelete={(id) => confirm("Excluir produto?") && remove(id)}
        onDuplicate={duplicate}
        onSearch={(s) => {
          setSearch(s);
          fetch({ page: 1 });
        }}
        total={total}
        page={query.page ?? 1}
        pageSize={query.pageSize ?? 10}
        onPageChange={(p) => {
          setPage(p);
          fetch({ page: p });
        }}
      />

      <ProductFormDialog
        open={dialog.open}
        editing={dialog.editing || undefined}
        onClose={closeDialog}
        onSubmitCreate={(payload) => add(payload)}
        onSubmitUpdate={(id, payload) => update(id, payload)}
      />
    </div>
  );
}
