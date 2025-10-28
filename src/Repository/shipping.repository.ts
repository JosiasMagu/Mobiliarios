import { httpGet, httpPost } from "@/Utils/api";

export type ShippingService = "standard" | "express" | "pickup" | "zone";

export type Carrier = {
  id: number | string;
  name: string;
  service: ShippingService;
  baseCost: number;
  zoneJson?: string | null;
  costPerKg?: number;
  minDays?: number;
  maxDays?: number;
  active?: boolean;
};

export type CarrierUpsert = Omit<Carrier, "id"> & { id?: string | number };

export type ShippingRules = {
  freeShippingMin?: number;
  enablePickup: boolean;
};

function safeUUID(): string {
  try {
    // browser moderno
    // @ts-ignore
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {}
  // fallback
  return `tmp-${Math.random().toString(36).slice(2)}${Date.now()}`;
}

function normalizeCarrier(r: any): Carrier {
  return {
    id: r.id ?? r._id ?? r.uuid ?? safeUUID(),
    name: String(r.name ?? ""),
    service: String(r.service ?? "standard").toLowerCase() as ShippingService,
    baseCost: Number(r.baseCost ?? 0),
    zoneJson: r.zoneJson ?? null,
    costPerKg: r.costPerKg != null ? Number(r.costPerKg) : undefined,
    minDays: r.minDays != null ? Number(r.minDays) : undefined,
    maxDays: r.maxDays != null ? Number(r.maxDays) : undefined,
    active: r.active != null ? Boolean(r.active) : true,
  };
}

export async function listShippingRules(): Promise<Carrier[]> {
  const rules = await httpGet<any[]>("/api/shipping/rules");
  return (rules ?? []).map(normalizeCarrier);
}

export async function listCarriers(): Promise<Carrier[]> {
  return listShippingRules();
}

export async function upsertCarrier(c: CarrierUpsert): Promise<Carrier[]> {
  const url = c.id ? `/api/shipping/rules/${c.id}` : "/api/shipping/rules";
  await httpPost(url, c);
  return listShippingRules();
}

export async function deleteCarrier(id: string | number): Promise<Carrier[]> {
  await httpPost(`/api/shipping/rules/${id}/delete`, {});
  return listShippingRules();
}

export async function getShippingRules(): Promise<ShippingRules> {
  const r = await httpGet<any>("/api/shipping/settings");
  return {
    freeShippingMin: r?.freeShippingMin != null ? Number(r.freeShippingMin) : undefined,
    enablePickup: Boolean(r?.enablePickup ?? true),
  };
}

export async function saveShippingRules(rules: ShippingRules): Promise<ShippingRules> {
  const r = await httpPost<any>("/api/shipping/settings", rules);
  return {
    freeShippingMin: r?.freeShippingMin != null ? Number(r.freeShippingMin) : rules.freeShippingMin,
    enablePickup: Boolean(r?.enablePickup ?? rules.enablePickup),
  };
}

export function estimateZoneCost(rule: Carrier, weightKg: number): number {
  const perKg = Number(rule.costPerKg ?? 0);
  const base = Number(rule.baseCost ?? 0);
  const w = Math.max(0, Number(weightKg || 0));
  return Math.round((base + perKg * w) * 100) / 100;
}
