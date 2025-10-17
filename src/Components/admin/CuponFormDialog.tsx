// src/Components/admin/CouponFormDialog.tsx
import type { FC, FormEvent } from "react";
import type { Coupon } from "@repo/marketing.repository";

type Props = {
  open: boolean;
  initial?: Partial<Coupon>;
  onClose: () => void;
  onSubmit: (data: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "used">) => void;
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[13px] font-medium text-slate-700">{children}</span>
);

const Field = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...p}
    className={`rounded-lg ring-1 ring-slate-200 focus:ring-slate-400 bg-white px-3 py-2 outline-none w-full ${p.className ?? ""}`}
  />
);

const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...p}
    className={`rounded-lg ring-1 ring-slate-200 focus:ring-slate-400 bg-white px-3 py-2 outline-none w-full ${p.className ?? ""}`}
  />
);

const Row = ({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 }) => (
  <div className={`grid gap-3 ${cols === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
    {children}
  </div>
);

const Helper = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[11px] text-slate-500">{children}</span>
);

const AdornedNumber = ({
  name,
  defaultValue,
  prefix,
  min,
  max,
  step,
  required,
  ariaLabel,
}: {
  name: string;
  defaultValue?: number | string;
  prefix: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  ariaLabel?: string;
}) => (
  <div className="relative">
    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">{prefix}</span>
    <Field
      name={name}
      type="number"
      inputMode="decimal"
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step ?? 0.01}
      defaultValue={defaultValue ?? ""}
      className="pl-7"
      required={required}
    />
  </div>
);

const CouponFormDialog: FC<Props> = ({ open, initial, onClose, onSubmit }) => {
  if (!open) return null;
  const i = initial ?? {};

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const type = (fd.get("type") as "percent" | "fixed") ?? "percent";
    const value = Number(fd.get("value") || 0);

    if (type === "percent" && (value < 0 || value > 100)) {
      alert("Para tipo percentual, o valor deve estar entre 0 e 100.");
      return;
    }

    const payload = {
      code: String(fd.get("code") || "").trim().toUpperCase(),
      type,
      value,
      minOrder: fd.get("minOrder") ? Number(fd.get("minOrder")) : undefined,
      maxUses: fd.get("maxUses") ? Number(fd.get("maxUses")) : undefined,
      active: Boolean(fd.get("active")),
      expiresAt: fd.get("expiresAt") ? String(fd.get("expiresAt")) : undefined,
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-3">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/60">
        <div className="px-5 py-3 border-b border-slate-200/60 font-bold">
          {i.id ? "Editar Cupom" : "Novo Cupom"}
        </div>

        <form className="p-5 grid gap-4" onSubmit={handleSubmit}>
          <Row>
            <label className="grid gap-1">
              <Label>Código</Label>
              <Field
                name="code"
                autoFocus
                maxLength={24}
                placeholder="EX.: BEMVINDO10"
                pattern="[A-Za-z0-9\-_]+"
                title="Apenas letras, números, - e _"
                defaultValue={i.code ?? ""}
                required
              />
              <Helper>Use letras maiúsculas, números e hífen/underscore.</Helper>
            </label>

            <label className="grid gap-1">
              <Label>Tipo</Label>
              <Select name="type" defaultValue={i.type ?? "percent"}>
                <option value="percent">% Percentual</option>
                <option value="fixed">Valor fixo</option>
              </Select>
              <Helper>Percentual aplica sobre o subtotal.</Helper>
            </label>
          </Row>

          <Row cols={3}>
            <label className="grid gap-1">
              <Label>Valor</Label>
              {/** prefixo muda só visualmente; validação no submit */}
              {i.type === "fixed" ? (
                <AdornedNumber name="value" defaultValue={i.value ?? 0} prefix="MZN" min={0} step={0.01} required ariaLabel="Valor do cupom" />
              ) : (
                <AdornedNumber name="value" defaultValue={i.value ?? 0} prefix="%" min={0} max={100} step={0.01} required ariaLabel="Percentual de desconto" />
              )}
            </label>

            <label className="grid gap-1">
              <Label>Mín. pedido</Label>
              <AdornedNumber name="minOrder" defaultValue={i.minOrder ?? ""} prefix="MZN" min={0} step={0.01} ariaLabel="Valor mínimo do pedido" />
            </label>

            <label className="grid gap-1">
              <Label>Máx. usos</Label>
              <Field name="maxUses" type="number" min={1} step={1} placeholder="Opcional" defaultValue={i.maxUses ?? ""} />
            </label>
          </Row>

          <Row>
            <label className="grid gap-1">
              <Label>Expira em</Label>
              <Field
                name="expiresAt"
                type="date"
                defaultValue={i.expiresAt ? i.expiresAt.slice(0, 10) : ""}
              />
              <Helper>Deixe vazio para sem expiração.</Helper>
            </label>

            <div className="grid content-end">
              <label className="inline-flex items-center gap-2">
                <input name="active" type="checkbox" defaultChecked={i.active ?? true} />
                <span className="text-sm text-slate-700">Ativo</span>
              </label>
            </div>
          </Row>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg ring-1 ring-slate-200 px-3 py-2 text-sm bg-white hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponFormDialog;
