import { httpGet } from "@/Utils/api";

export type ShippingService = "standard" | "express" | "pickup" | "zone";

export type Carrier = {
  id: number;
  name: string;
  service: ShippingService;
  baseCost: number;
  zoneJson?: string | null;
  // opcionais
  costPerKg?: number;
  minDays?: number;
  maxDays?: number;
  active?: boolean;
};

export async function listShippingRules(): Promise<Carrier[]> {
  const rules = await httpGet<any[]>("/api/shipping/rules");
  return rules.map(r => ({
    ...r,
    id: Number(r.id),
    name: String(r.name),
    service: String(r.service).toLowerCase() as ShippingService,
    baseCost: Number(r.baseCost ?? 0),
    zoneJson: r.zoneJson ?? null,
  }));
}

/** Estimativa simples de custo por zona (base + perKg*weight). */
export function estimateZoneCost(rule: Carrier, weightKg: number): number {
  const perKg = Number(rule.costPerKg ?? 0);
  const base = Number(rule.baseCost ?? 0);
  const w = Math.max(0, Number(weightKg || 0));
  return Math.round((base + perKg * w) * 100) / 100;
}
