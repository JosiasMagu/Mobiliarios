// src/Components/admin/PaymentMethodFormDialog.tsx
import React, { useEffect, useMemo, useState } from "react";
import { upsertPaymentMethod, MZ_PHONE_REGEX } from "@/Repository/payment.repository";
import type { PaymentKind, PaymentMethod } from "@/Repository/payment.repository";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: PaymentMethod;
};

const typeOptions: { value: PaymentKind; label: string }[] = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "emola", label: "eMola" },
  { value: "bank", label: "Conta bancária" },
];

export default function PaymentMethodFormDialog({ open, onClose, initial }: Props) {
  // Não colocar id aqui. Sem id => CREATE. Com id => UPDATE.
  const [form, setForm] = useState<PaymentMethod>({
    // id: undefined
    id: "" as any, // manter o tipo, mas vazio para não acionar update
    name: "M-Pesa",
    type: "mpesa",
    active: true,
    walletPhone: "",
    feePct: undefined,
    fixedFee: undefined,
    instructions: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm(initial);
    } else {
      setForm({
        id: "" as any,
        name: "M-Pesa",
        type: "mpesa",
        active: true,
        walletPhone: "",
        feePct: undefined,
        fixedFee: undefined,
        instructions: "",
      });
    }
  }, [open, initial]);

  const isWallet = form.type === "mpesa" || form.type === "emola";
  const isBank = form.type === "bank";

  const valid = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = "Nome obrigatório.";
    if (!form.type) e.type = "Tipo obrigatório.";

    if (isWallet) {
      const digits = String(form.walletPhone ?? "").replace(/\D/g, "");
      if (!digits) e.walletPhone = "Telefone obrigatório.";
      else if (!MZ_PHONE_REGEX.test(digits)) e.walletPhone = "Telefone inválido.";
    }

    if (isBank) {
      if (!form.bankName?.trim()) e.bankName = "Banco obrigatório.";
      if (!form.accountHolder?.trim()) e.accountHolder = "Titular obrigatório.";
      if (!form.accountNumber?.trim()) e.accountNumber = "Nº da conta obrigatório.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, isWallet, isBank]);

  if (!open) return null;

  function update<K extends keyof PaymentMethod>(key: K, value: PaymentMethod[K]) {
    // sanitiza telefone da carteira
    if (key === "walletPhone") {
      value = String(value ?? "").replace(/\D/g, "") as any;
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;

    // garante que CREATE não envia id
    const payload: PaymentMethod = { ...form };
    if (!initial) {
      // remove id “vazio” antes de enviar
      // @ts-ignore
      delete payload.id;
    }
    await upsertPaymentMethod(payload);
    onClose();
  }

  const inputCls =
    "input rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-slate-400";

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-2xl max-h-[90vh] rounded-xl bg-white p-6 shadow-xl overflow-y-auto"
        aria-describedby="pm-desc"
      >
        <h2 className="text-xl font-semibold">Método de pagamento</h2>
        <p id="pm-desc" className="text-sm text-gray-500 mb-4">
          Configure M-Pesa, eMola ou Conta bancária.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
          <label className="flex flex-col gap-1">
            <span>Nome</span>
            <input
              value={form.name ?? ""}
              onChange={(e) => update("name", e.target.value)}
              className={inputCls}
              aria-invalid={!!errors.name}
            />
            {errors.name && <span className="text-red-600 text-sm">{errors.name}</span>}
          </label>

          <label className="flex flex-col gap-1">
            <span>Tipo</span>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value as PaymentKind)}
              className={inputCls}
              aria-invalid={!!errors.type}
            >
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.type && <span className="text-red-600 text-sm">{errors.type}</span>}
          </label>

          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={!!form.active}
              onChange={(e) => update("active", e.target.checked)}
            />
            <span>Ativo</span>
          </label>

          <label className="flex flex-col gap-1">
            <span>Taxa (%) opcional</span>
            <input
              type="number"
              step="0.01"
              value={form.feePct ?? ""}
              onChange={(e) =>
                update("feePct", e.target.value === "" ? undefined : Number(e.target.value))
              }
              className={inputCls}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>Taxa fixa (MZN) opcional</span>
            <input
              type="number"
              step="0.01"
              value={form.fixedFee ?? ""}
              onChange={(e) =>
                update("fixedFee", e.target.value === "" ? undefined : Number(e.target.value))
              }
              className={inputCls}
            />
          </label>

          {isWallet && (
            <label className="flex flex-col gap-1 md:col-span-2">
              <span>Telefone da carteira (MZ)</span>
              <input
                value={form.walletPhone ?? ""}
                onChange={(e) => update("walletPhone", e.target.value)}
                placeholder="82/83/84/85/86/87 + 7 dígitos"
                className={inputCls}
                aria-invalid={!!errors.walletPhone}
              />
              {errors.walletPhone && (
                <span className="text-red-600 text-sm">{errors.walletPhone}</span>
              )}
            </label>
          )}

          {isBank && (
            <>
              <label className="flex flex-col gap-1">
                <span>Banco</span>
                <input
                  value={form.bankName ?? ""}
                  onChange={(e) => update("bankName", e.target.value)}
                  className={inputCls}
                  aria-invalid={!!errors.bankName}
                />
                {errors.bankName && <span className="text-red-600 text-sm">{errors.bankName}</span>}
              </label>

              <label className="flex flex-col gap-1">
                <span>Titular</span>
                <input
                  value={form.accountHolder ?? ""}
                  onChange={(e) => update("accountHolder", e.target.value)}
                  className={inputCls}
                  aria-invalid={!!errors.accountHolder}
                />
                {errors.accountHolder && (
                  <span className="text-red-600 text-sm">{errors.accountHolder}</span>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span>Nº da conta</span>
                <input
                  value={form.accountNumber ?? ""}
                  onChange={(e) => update("accountNumber", e.target.value)}
                  className={inputCls}
                  aria-invalid={!!errors.accountNumber}
                />
                {errors.accountNumber && (
                  <span className="text-red-600 text-sm">{errors.accountNumber}</span>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <span>NIB/IBAN (opcional)</span>
                <input
                  value={form.iban ?? ""}
                  onChange={(e) => update("iban", e.target.value)}
                  className={inputCls}
                />
              </label>
            </>
          )}

          <label className="flex flex-col gap-1 md:col-span-2">
            <span>Instruções ao cliente</span>
            <textarea
              value={form.instructions ?? ""}
              onChange={(e) => update("instructions", e.target.value)}
              className={`${inputCls} min-h-[100px]`}
            />
          </label>
        </div>

        <div className="sticky bottom-0 bg-white pt-4 border-t mt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={!valid}>
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
