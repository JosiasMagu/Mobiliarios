import { useEffect, useMemo, useState } from "react";
import { useAdminCustomers } from "@state/customer.admin.sotre";
import CustomerTable from "@comp/admin/CustomerTable";
import CustomerDetailDialog from "@comp/admin/CustomerDetailDialog";

export default function CustomersPage() {
  const store = useAdminCustomers();
  const [q, setQ] = useState("");

  useEffect(() => {
    // carrega apenas uma vez
    store.fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return store.items;
    return store.items.filter((r) => {
      const p = r.profile;
      return (
        (p.name || "").toLowerCase().includes(s) ||
        (p.email || "").toLowerCase().includes(s)
      );
    });
  }, [store.items, q]);

  return (
    <div className="space-y-4">
      <div className="text-xl font-extrabold">Gestão de Clientes</div>

      <CustomerTable
        data={filtered}
        loading={store.loading}
        onOpen={(id) => store.open(id)}
        onSearch={setQ}
      />

      <CustomerDetailDialog
        open={!!store.current}
        data={store.current}
        onClose={() => store.close()}
      />
    </div>
  );
}
