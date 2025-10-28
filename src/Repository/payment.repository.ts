import { httpGet, httpPost } from "@/Utils/api";

export type PaymentKind = "emola" | "mpesa" | "bank";

export type PaymentMethod = {
  id: string | number;
  name: string;
  type: PaymentKind;
  active: boolean;
  walletPhone?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  iban?: string;
  feePct?: number;
  fixedFee?: number;
  instructions?: string;
};

export const MZ_PHONE_REGEX = /^(?:82|83|84|85|86|87)\d{7}$/;

function safeUUID(): string {
  try {
    // @ts-ignore
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {}
  return `pm-${Math.random().toString(36).slice(2)}${Date.now()}`;
}

function normalize(m: any): PaymentMethod {
  return {
    id: String(m.id ?? m.uuid ?? m._id ?? safeUUID()),
    name: String(m.name ?? ""),
    type: String(m.type ?? "mpesa").toLowerCase() as PaymentKind,
    active: Boolean(m.active ?? true),
    walletPhone: m.walletPhone ?? m.phone ?? undefined,
    bankName: m.bankName ?? undefined,
    accountHolder: m.accountHolder ?? m.holder ?? undefined,
    accountNumber: m.accountNumber ?? m.accNumber ?? undefined,
    iban: m.iban ?? m.nib ?? undefined,
    feePct: m.feePct != null ? Number(m.feePct) : undefined,
    fixedFee: m.fixedFee != null ? Number(m.fixedFee) : undefined,
    instructions: m.instructions ?? undefined,
  };
}

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  const items = await httpGet<any[]>("/api/payments/methods");
  return (items ?? []).map(normalize);
}

export async function upsertPaymentMethod(pm: PaymentMethod): Promise<PaymentMethod> {
  const isUpdate = !!pm.id;
  const url = isUpdate ? `/api/payments/methods/${pm.id}` : "/api/payments/methods";
  const res = await httpPost<any>(url, pm);
  return normalize(res ?? pm);
}

export async function removePaymentMethod(id: string | number): Promise<void> {
  await httpPost(`/api/payments/methods/${id}/delete`, {});
}
