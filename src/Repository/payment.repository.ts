import { httpGet } from "@/Utils/api";

export type PaymentKind = "emola" | "mpesa" | "bank";

export type PaymentMethod = {
  id: number;
  name: string;
  type: PaymentKind;
  active: boolean;
  walletPhone?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
};

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  const items = await httpGet<any[]>("/api/payments/methods");
  return items.map(m => ({
    ...m,
    id: Number(m.id),
    type: String(m.type).toLowerCase() as PaymentKind,
    active: Boolean(m.active),
  }));
}
