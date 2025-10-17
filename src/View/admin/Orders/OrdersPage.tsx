import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAdminOrders } from "@state/order.admin.store";
import type { Order as RepoOrder, OrderStatus } from "@repo/order.repository";
import type { Order as ModelOrder } from "@model/order.model";
import OrderTable from "@comp/admin/OrderTable";
import OrderDetailDialog from "@comp/admin/OrderDetailDialog";

/** Adapta o Order do repositório para o Order do Model usado pela tabela */
function adapt(o: RepoOrder): ModelOrder {
  return {
    // mínimos usados pela OrderTable
    id: o.id,
    number: o.number,
    customer: {
      name: o.customer.name,
      email: o.customer.email,
      guest: o.customer.guest,
    },
    status: o.status,
    total: o.total,
    createdAt: o.createdAt,

    // campos exigidos pelo tipo do Model
    items: o.items,
    subtotal: o.subtotal,
    shippingCost: o.shippingCost,

    // nomes que o Model espera
    shippingAddress: o.address,
    paymentMethod: o.payment?.method,

    // extras opcionais
    history: o.history ?? [],
  } as unknown as ModelOrder;
}

export default function OrdersPage() {
  const store = useAdminOrders();
  const [query, setQuery] = useState("");

  useEffect(() => { store.fetch(); }, []);

  const tableData: ModelOrder[] = useMemo(
    () => store.items.map(adapt),
    [store.items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tableData;
    return tableData.filter(o =>
      (o.number || `#${o.id}`).toLowerCase().includes(q) ||
      (o.customer?.name ?? "").toLowerCase().includes(q) ||
      (o.customer?.email ?? "").toLowerCase().includes(q)
    );
  }, [tableData, query]);

  return (
    <div className="space-y-4">
      <div className="text-xl font-extrabold">Gestão de Pedidos</div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar por nº do pedido ou cliente"
          className="w-full rounded-xl ring-1 ring-slate-200 pl-9 pr-3 py-2 outline-none bg-white focus:ring-slate-400"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <OrderTable
        data={filtered}
        loading={store.loading}
        onOpen={(id) => store.open(id)}
      />

      <OrderDetailDialog
        open={!!store.current}
        order={store.current as RepoOrder | null}
        onClose={() => store.close()}
        onUpdateStatus={(status: OrderStatus, note?: string) =>
          store.setStatus(String(store.current?.id), status, note)
        }
        onAddNote={(note: string) =>
          store.addNote(String(store.current?.id), note)
        }
      />
    </div>
  );
}
