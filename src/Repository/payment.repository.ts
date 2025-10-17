// src/Repository/payment.repository.ts
export type PaymentKind = "emola" | "mpesa" | "bank";

export type PaymentMethod = {
  id: string;
  name: string;
  type: PaymentKind;
  feePct?: number;
  fixedFee?: number;
  active: boolean;
  instructions?: string;
  walletPhone?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  iban?: string;
};

const LS_KEY = "mobiliario.payments:v1";

function load(): PaymentMethod[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function save(list: PaymentMethod[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// seed inicial se vazio
(function seed() {
  const cur = load();
  if (cur.length === 0) {
    save([
      {
        id: "mpesa-default",
        name: "M-Pesa",
        type: "mpesa",
        active: true,
        walletPhone: "84XXXXXXX",
        instructions: "Pague via M-Pesa para o número indicado e guarde o comprovativo.",
      },
      {
        id: "emola-default",
        name: "eMola",
        type: "emola",
        active: true,
        walletPhone: "86XXXXXXX",
        instructions: "Pague via eMola e guarde o comprovativo.",
      },
      {
        id: "bank-default",
        name: "Conta bancária",
        type: "bank",
        active: true,
        bankName: "Moza Banco",
        accountHolder: "Empresa XYZ Lda",
        accountNumber: "0000000000000",
        iban: "",
        instructions: "Faça transferência/depósito e envie o comprovativo.",
      },
    ]);
  }
})();

export function listPaymentMethods(activeOnly = true): PaymentMethod[] {
  const all = load();
  return activeOnly ? all.filter((m) => m.active) : [...all];
}
export function getPaymentMethod(id: string): PaymentMethod | undefined {
  return load().find((m) => m.id === id);
}
export function upsertPaymentMethod(m: PaymentMethod): void {
  const all = load();
  const i = all.findIndex((x) => x.id === m.id);
  if (i >= 0) all[i] = { ...all[i], ...m };
  else all.push(m);
  save(all);
}
export function removePaymentMethod(id: string): void {
  save(load().filter((m) => m.id !== id));
}
export const deletePaymentMethod = removePaymentMethod;

export const MZ_PHONE_REGEX = /^(?:82|83|84|85|86|87)\d{7}$/;
