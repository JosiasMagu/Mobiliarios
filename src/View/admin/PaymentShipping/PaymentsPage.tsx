// src/View/admin/PaymentShipping/PaymentsPage.tsx
import { useEffect, useState } from "react";
import {
  listPaymentMethods,
  upsertPaymentMethod,
  removePaymentMethod,
  type PaymentMethod,
} from "@/Repository/payment.repository";
import {
  listCarriers,
  upsertCarrier,
  deleteCarrier,
  getShippingRules,
  saveShippingRules,
  type Carrier,
  type ShippingRules,
} from "@/Repository/shipping.repository";
import PaymentMethodFormDialog from "@/Components/admin/PaymentMethodFormDialog";
import CarrierFormDialog from "@/Components/admin/CarrierFormDialog";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [rules, setRules] = useState<ShippingRules>({ enablePickup: true });
  const [pmOpen, setPmOpen] = useState(false);
  const [pmEdit, setPmEdit] = useState<PaymentMethod | null>(null);
  const [crOpen, setCrOpen] = useState(false);
  const [crEdit, setCrEdit] = useState<Carrier | null>(null);

  const reloadAll = () => {
    setPayments(listPaymentMethods());
    setCarriers(listCarriers());
    setRules(getShippingRules());
  };

  useEffect(() => {
    reloadAll();
  }, []);

  return (
    <div className="space-y-6">
      {/* Métodos de pagamento */}
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold">Métodos de Pagamento</div>
          <button
            className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2"
            onClick={() => { setPmEdit(null); setPmOpen(true); }}
          >
            Novo método
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2">Nome</th>
                <th className="text-left px-3 py-2">Tipo</th>
                <th className="text-left px-3 py-2">Taxas</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-right px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-t border-slate-200/60">
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2 uppercase">{p.type}</td>
                  <td className="px-3 py-2">
                    {p.feePct ? `${p.feePct}%` : "-"} {p.fixedFee ? ` | MZN ${p.fixedFee}` : ""}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ring-1 ${p.active ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                      {p.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-md ring-1 ring-slate-200 px-2 py-1" onClick={() => { setPmEdit(p); setPmOpen(true); }}>Editar</button>
                      <button
                        className="rounded-md ring-1 ring-rose-200 text-rose-700 px-2 py-1"
                        onClick={() => { removePaymentMethod(p.id); setPayments(listPaymentMethods()); }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">Nenhum método cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Envio */}
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold">Opções de Envio</div>
          <button
            className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2"
            onClick={() => { setCrEdit(null); setCrOpen(true); }}
          >
            Nova opção
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2">Serviço</th>
                <th className="text-left px-3 py-2">Tipo</th>
                <th className="text-left px-3 py-2">Custos</th>
                <th className="text-left px-3 py-2">Prazo</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-right px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {carriers.map(c => (
                <tr key={c.id} className="border-t border-slate-200/60">
                  <td className="px-3 py-2">{c.name}</td>
                  <td className="px-3 py-2 capitalize">{c.service}</td>
                  <td className="px-3 py-2">MZN {c.baseCost}{c.costPerKg ? ` + MZN ${c.costPerKg}/Kg` : ""}</td>
                  <td className="px-3 py-2">
                    {c.minDays ?? "-"}–{c.maxDays ?? "-"} dias
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ring-1 ${c.active ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                      {c.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-md ring-1 ring-slate-200 px-2 py-1" onClick={() => { setCrEdit(c); setCrOpen(true); }}>Editar</button>
                      <button
                        className="rounded-md ring-1 ring-rose-200 text-rose-700 px-2 py-1"
                        onClick={() => setCarriers(deleteCarrier(c.id))}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {carriers.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">Nenhuma opção de envio.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Regras */}
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
        <div className="font-bold mb-3">Regras de Frete</div>
        <form
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            const next: ShippingRules = {
              freeShippingMin: fd.get("freeShippingMin") ? Number(fd.get("freeShippingMin")) : undefined,
              enablePickup: Boolean(fd.get("enablePickup")),
            };
            setRules(saveShippingRules(next));
          }}
        >
          <label className="grid gap-1 text-sm">
            <span>Frete grátis a partir de (MZN)</span>
            <input
              name="freeShippingMin"
              type="number"
              step="0.01"
              min={0}
              defaultValue={rules.freeShippingMin ?? ""}
              className="rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="enablePickup" type="checkbox" defaultChecked={rules.enablePickup} />
            <span>Permitir retirada no local</span>
          </label>
          <div className="flex justify-end">
            <button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2">
              Guardar regras
            </button>
          </div>
        </form>
      </section>

      {/* Dialogs */}
      <PaymentMethodFormDialog
        open={pmOpen}
        initial={pmEdit ?? undefined}
        onClose={() => { setPmOpen(false); setPayments(listPaymentMethods()); }}
      />
      <CarrierFormDialog
        open={crOpen}
        initial={crEdit ?? undefined}
        onClose={() => setCrOpen(false)}
        onSubmit={(data) => { setCarriers(upsertCarrier(data)); }}
      />
    </div>
  );
}
