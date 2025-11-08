// src/Services/shipping.service.ts (mock)
export type ShippingMethod = {
  code: "standard" | "express";
  label: string;
  eta: string;
  cost: number;
};

export function listShippingMethods(_zip?: string): ShippingMethod[] {
  return [
    { code: "standard", label: "Padrão", eta: "5–7 dias úteis", cost: 0 },
    { code: "express", label: "Expresso", eta: "2–3 dias úteis", cost: 250 },
  ];
}
