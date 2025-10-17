// src/Repository/shipping.repository.ts

export type ShippingService = "standard" | "express" | "flat" | "pickup" | "zone";

export type Carrier = {
  id: string;
  name: string;
  service: ShippingService;
  baseCost: number;
  costPerKg?: number;
  minDays?: number;
  maxDays?: number;
  active: boolean;
};

// ------------------- Persistência -------------------
const CARRIERS_KEY = "mobiliario.carriers";
const RULES_KEY = "mobiliario.shipping.rules";
const ZONE_KEY = "mobiliario.shipping.zoneRule";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ------------------- Transportadoras -------------------
let _carriers: Carrier[] = load<Carrier[]>(CARRIERS_KEY, [
  {
    id: "std-1",
    name: "Entrega padrão",
    service: "standard",
    baseCost: 150,
    costPerKg: 0,
    minDays: 2,
    maxDays: 5,
    active: true,
  },
  {
    id: "pickup-1",
    name: "Retirar no local",
    service: "pickup",
    baseCost: 0,
    active: true,
  },
]);

export function listCarriers(activeOnly = false): Carrier[] {
  return activeOnly ? _carriers.filter((c) => c.active) : [..._carriers];
}

export function upsertCarrier(data: Omit<Carrier, "id"> & { id?: string }): Carrier[] {
  const id = data.id ?? crypto.randomUUID();
  const next: Carrier = { id, ...data, active: data.active ?? true };
  const i = _carriers.findIndex((c) => c.id === id);
  if (i >= 0) _carriers[i] = { ..._carriers[i], ...next };
  else _carriers.push(next);
  save(CARRIERS_KEY, _carriers);
  return listCarriers(false);
}

export function deleteCarrier(id: string): Carrier[] {
  _carriers = _carriers.filter((c) => c.id !== id);
  save(CARRIERS_KEY, _carriers);
  return listCarriers(false);
}

// ------------------- Regras simples de frete -------------------
export type ShippingRules = {
  freeShippingMin?: number;
  enablePickup: boolean;
};

let _rules: ShippingRules = load<ShippingRules>(RULES_KEY, { enablePickup: true });

export function getShippingRules(): ShippingRules {
  return { ..._rules };
}

export function saveShippingRules(r: ShippingRules): ShippingRules {
  // corrigido: não repetir enablePickup
  _rules = { ..._rules, ...r };
  save(RULES_KEY, _rules);
  return getShippingRules();
}

// ------------------- Regras por zona -------------------
export type ZoneCost = {
  provincia: string;
  cidade?: string;
  bairro?: string;
  cost: number;
};

export type ZoneRule = {
  id: string;
  name: string;
  service: "zone";
  active: boolean;
  zones: ZoneCost[];
  description?: string;
};

let _zoneRule: ZoneRule = load<ZoneRule>(ZONE_KEY, {
  id: "zone-1",
  name: "Entrega por zona",
  service: "zone",
  active: false,
  zones: [
    { provincia: "Sofala", cidade: "Beira", bairro: "Pioneiros", cost: 120 },
    { provincia: "Sofala", cidade: "Beira", bairro: "Macúti", cost: 150 },
    { provincia: "Sofala", cidade: "Dondo", cost: 200 },
  ],
});

export function listShippingRules(activeOnly = true): Array<Carrier | ZoneRule> {
  const base = activeOnly ? _carriers.filter((c) => c.active) : _carriers.slice();
  const out: Array<Carrier | ZoneRule> = [...base];
  if (!activeOnly || _zoneRule.active) out.push(_zoneRule);
  return out;
}

export function estimateZoneCost(
  provincia: string,
  cidade?: string,
  bairro?: string
): number | undefined {
  if (!_zoneRule.active) return undefined;
  const exact = _zoneRule.zones.find(
    (v) =>
      v.provincia.toLowerCase() === provincia.toLowerCase() &&
      (!cidade || (v.cidade ?? "").toLowerCase() === cidade.toLowerCase()) &&
      (!bairro || (v.bairro ?? "").toLowerCase() === bairro.toLowerCase())
  );
  if (exact) return exact.cost;

  const byProv = _zoneRule.zones.find(
    (v) => v.provincia.toLowerCase() === provincia.toLowerCase() && !v.cidade && !v.bairro
  );
  return byProv?.cost;
}

export function saveZoneRule(rule: ZoneRule): ZoneRule {
  _zoneRule = { ..._zoneRule, ...rule };
  save(ZONE_KEY, _zoneRule);
  return _zoneRule;
}
