// src/Components/admin/CarrierFormDialog.tsx
import type { FC, FormEvent } from "react";
import type { Carrier, ShippingService } from "@/Repository/shipping.repository";

type Props = {
  open: boolean;
  initial?: Partial<Carrier>;
  onClose: () => void;
  onSubmit: (data: Omit<Carrier, "id"> & { id?: string }) => void;
};

const CarrierFormDialog: FC<Props> = ({ open, initial, onClose, onSubmit }) => {
  if (!open) return null;
  const i = initial ?? {};

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      id: i.id as string | undefined,
      name: String(fd.get("name") || "").trim(),
      service: (fd.get("service") as ShippingService) ?? "standard",
      baseCost: Number(fd.get("baseCost") || 0),
      costPerKg: fd.get("costPerKg") ? Number(fd.get("costPerKg")) : undefined,
      minDays: fd.get("minDays") ? Number(fd.get("minDays")) : undefined,
      maxDays: fd.get("maxDays") ? Number(fd.get("maxDays")) : undefined,
      active: Boolean(fd.get("active")),
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-3">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/60">
        <div className="px-5 py-3 border-b border-slate-200/60 font-bold">
          {i.id ? "Editar envio" : "Nova opção de envio"}
        </div>
        <form className="p-5 grid gap-3" onSubmit={submit}>
          <label className="grid gap-1 text-sm">
            <span>Transportadora/Serviço</span>
            <input name="name" defaultValue={i.name ?? ""} required className="rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              <span>Tipo</span>
              <select name="service" defaultValue={(i.service as ShippingService) ?? "standard"} className="rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none">
                <option value="standard">Padrão</option>
                <option value="express">Expresso</option>
                <option value="flat">Taxa fixa</option>
                <option value="pickup">Retirada no local</option>
              </select>
            </label>
            <label className="flex items-end gap-2 text-sm">
              <input name="active" type="checkbox" defaultChecked={i.active ?? true} />
              <span>Ativo</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              <span>Custo base (MZN)</span>
              <input name="baseCost" type="number" step="0.01" min={0} defaultValue={i.baseCost ?? 0} className="rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none" />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Custo por Kg (MZN)</span>
              <input name="costPerKg" type="number" step="0.01" min={0} defaultValue={i.costPerKg ?? ""} className="rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              <span>Prazo mínimo (dias)</span>
              <input name="minDays" type="number" min={0} defaultValue={i.minDays ?? ""} className="rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none" />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Prazo máximo (dias)</span>
              <input name="maxDays" type="number" min={0} defaultValue={i.maxDays ?? ""} className="rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none" />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm bg-white hover:bg-slate-50">Cancelar</button>
            <button type="submit" className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarrierFormDialog;
