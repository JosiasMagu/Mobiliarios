import { useEffect, useMemo, useState } from "react";
import type { Carrier, CarrierUpsert, ShippingService } from "@/Repository/shipping.repository";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Carrier;                // edição
  onSubmit: (data: CarrierUpsert) => void; // cria/atualiza
};

const serviceOptions: { value: ShippingService; label: string }[] = [
  { value: "standard", label: "Padrão (3–5 dias úteis)" },
  { value: "express",  label: "Expresso (1–2 dias úteis)" },
  { value: "pickup",   label: "Retirar no local" },
  { value: "zone",     label: "Por zona (base + Kg)" },
];

export default function CarrierFormDialog({ open, onClose, initial, onSubmit }: Props) {
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [service, setService] = useState<ShippingService>((initial?.service as ShippingService) ?? "standard");
  const [baseCost, setBaseCost] = useState<number>(Number(initial?.baseCost ?? 0));
  const [costPerKg, setCostPerKg] = useState<number | undefined>(
    initial?.costPerKg != null ? Number(initial.costPerKg) : undefined
  );
  const [minDays, setMinDays] = useState<number | undefined>(
    initial?.minDays != null ? Number(initial.minDays) : undefined
  );
  const [maxDays, setMaxDays] = useState<number | undefined>(
    initial?.maxDays != null ? Number(initial.maxDays) : undefined
  );
  const [zoneJson, setZoneJson] = useState<string>(typeof initial?.zoneJson === "string" ? initial!.zoneJson! : "");
  const [active, setActive] = useState<boolean>(initial?.active ?? true);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setService((initial?.service as ShippingService) ?? "standard");
    setBaseCost(Number(initial?.baseCost ?? 0));
    setCostPerKg(initial?.costPerKg != null ? Number(initial.costPerKg) : undefined);
    setMinDays(initial?.minDays != null ? Number(initial.minDays) : undefined);
    setMaxDays(initial?.maxDays != null ? Number(initial.maxDays) : undefined);
    setZoneJson(typeof initial?.zoneJson === "string" ? initial!.zoneJson! : "");
    setActive(initial?.active ?? true);
  }, [open, initial]);

  const isZone = service === "zone";
  const valid = useMemo(() => {
    if (!name.trim()) return false;
    if (!Number.isFinite(baseCost)) return false;
    if (isZone && (costPerKg == null || !Number.isFinite(Number(costPerKg)))) return false;
    return true;
  }, [name, baseCost, isZone, costPerKg]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;

    const payload: CarrierUpsert = {
      id: initial?.id as any,
      name: name.trim(),
      service,
      baseCost: Number(baseCost) || 0,
      costPerKg: isZone ? Number(costPerKg || 0) : undefined,
      minDays: minDays != null ? Number(minDays) : undefined,
      maxDays: maxDays != null ? Number(maxDays) : undefined,
      zoneJson: isZone ? (zoneJson?.trim() || null) : null,
      active,
    };

    onSubmit(payload);
    onClose();
  }

  const input =
    "rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-slate-400 bg-white";

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative w-full max-w-2xl max-h-[90vh] rounded-xl bg-white p-6 shadow-xl overflow-y-auto"
      >
        <h2 className="text-xl font-semibold">Opção de envio</h2>
        <p className="text-sm text-gray-500 mb-4">Crie ou edite uma transportadora/regra de frete.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span>Nome do serviço</span>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="grid gap-1">
            <span>Tipo</span>
            <select
              className={input}
              value={service}
              onChange={(e) => setService(e.target.value as ShippingService)}
            >
              {serviceOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span>Custo base (MZN)</span>
            <input
              className={input}
              type="number"
              step="0.01"
              min={0}
              value={baseCost}
              onChange={(e) => setBaseCost(Number(e.target.value))}
            />
          </label>

          <label className="grid gap-1">
            <span>Dias mínimos</span>
            <input
              className={input}
              type="number"
              min={0}
              value={minDays ?? ""}
              onChange={(e) => setMinDays(e.target.value === "" ? undefined : Number(e.target.value))}
            />
          </label>

          <label className="grid gap-1">
            <span>Dias máximos</span>
            <input
              className={input}
              type="number"
              min={0}
              value={maxDays ?? ""}
              onChange={(e) => setMaxDays(e.target.value === "" ? undefined : Number(e.target.value))}
            />
          </label>

          {isZone && (
            <>
              <label className="grid gap-1">
                <span>Custo por Kg (MZN)</span>
                <input
                  className={input}
                  type="number"
                  step="0.01"
                  min={0}
                  value={costPerKg ?? ""}
                  onChange={(e) =>
                    setCostPerKg(e.target.value === "" ? undefined : Number(e.target.value))
                  }
                />
              </label>

              <label className="grid gap-1 md:col-span-2">
                <span>JSON de zonas (opcional)</span>
                <textarea
                  className={`${input} min-h-[120px]`}
                  value={zoneJson}
                  onChange={(e) => setZoneJson(e.target.value)}
                  placeholder='Ex.: {"A":100,"B":150}'
                />
              </label>
            </>
          )}

          <label className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span>Ativo</span>
          </label>
        </div>

        <div className="sticky bottom-0 bg-white pt-4 border-t mt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" className="btn-primary" disabled={!valid}>Guardar</button>
        </div>
      </form>
    </div>
  );
}
