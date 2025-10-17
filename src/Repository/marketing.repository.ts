// In-memory repo para Marketing
import { listProducts } from "@repo/product.repository";

export type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;            // % para percent, MZN para fixed
  minOrder?: number;
  maxUses?: number;
  used?: number;
  active: boolean;
  expiresAt?: string;       // ISO
  createdAt: string;        // ISO
  updatedAt: string;        // ISO
};

export type LoyaltyTier = {
  id: string;
  name: string;            // Ex.: Bronze, Prata, Ouro
  minSpend: number;        // acumulado MZN
  perk: string;            // texto livre
};

export type Campaign = {
  id: string;
  name: string;
  provider?: "mailchimp" | "sendgrid" | "custom";
  externalId?: string;
  subject: string;
  audience: "all" | "customers" | "guests";
  status: "draft" | "scheduled" | "sent";
  scheduledAt?: string;    // ISO
  createdAt: string;       // ISO
  updatedAt: string;       // ISO
};

export type FeaturedConfig = {
  ids: number[];           // product ids
  updatedAt: string;       // ISO
};

const mem = {
  coupons: [] as Coupon[],
  tiers: [
    { id: "t1", name: "Bronze", minSpend: 0, perk: "5% em cupons selecionados" },
    { id: "t2", name: "Prata", minSpend: 10000, perk: "Frete padrão grátis" },
    { id: "t3", name: "Ouro", minSpend: 30000, perk: "10% off recorrente" },
  ] as LoyaltyTier[],
  campaigns: [] as Campaign[],
  featured: { ids: [], updatedAt: new Date().toISOString() } as FeaturedConfig,
};

const uid = () => Math.random().toString(36).slice(2);

/* ----------------------------- COUPONS ----------------------------------- */
export async function listCoupons(): Promise<Coupon[]> {
  return [...mem.coupons].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
export async function createCoupon(input: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "used">): Promise<Coupon> {
  const now = new Date().toISOString();
  const row: Coupon = { ...input, id: uid(), used: 0, createdAt: now, updatedAt: now };
  mem.coupons.push(row);
  return row;
}
export async function updateCoupon(id: string, patch: Partial<Coupon>): Promise<Coupon | null> {
  const i = mem.coupons.findIndex(c => c.id === id);
  if (i < 0) return null;
  mem.coupons[i] = { ...mem.coupons[i], ...patch, updatedAt: new Date().toISOString() };
  return mem.coupons[i];
}
export async function deleteCoupon(id: string): Promise<boolean> {
  const len = mem.coupons.length;
  mem.coupons = mem.coupons.filter(c => c.id !== id);
  return mem.coupons.length < len;
}

/* --------------------------- LOYALTY / TIERS ----------------------------- */
export async function listTiers(): Promise<LoyaltyTier[]> {
  return [...mem.tiers].sort((a, b) => a.minSpend - b.minSpend);
}
export async function upsertTier(t: Omit<LoyaltyTier, "id"> & { id?: string }): Promise<LoyaltyTier> {
  if (!t.id) {
    const row: LoyaltyTier = { ...t, id: uid() };
    mem.tiers.push(row);
    return row;
  }
  const i = mem.tiers.findIndex(x => x.id === t.id);
  if (i < 0) {
    const row: LoyaltyTier = { ...t, id: t.id };
    mem.tiers.push(row);
    return row;
  }
  mem.tiers[i] = { ...mem.tiers[i], ...t };
  return mem.tiers[i];
}
export async function deleteTier(id: string) {
  mem.tiers = mem.tiers.filter(t => t.id !== id);
  return true;
}

/* ----------------------------- CAMPAIGNS --------------------------------- */
export async function listCampaigns(): Promise<Campaign[]> {
  return [...mem.campaigns].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
export async function createCampaign(input: Omit<Campaign, "id" | "createdAt" | "updatedAt" | "status"> & { status?: Campaign["status"] }): Promise<Campaign> {
  const now = new Date().toISOString();
  const row: Campaign = { ...input, id: uid(), status: input.status ?? "draft", createdAt: now, updatedAt: now };
  mem.campaigns.push(row);
  return row;
}
export async function updateCampaign(id: string, patch: Partial<Campaign>): Promise<Campaign | null> {
  const i = mem.campaigns.findIndex(c => c.id === id);
  if (i < 0) return null;
  mem.campaigns[i] = { ...mem.campaigns[i], ...patch, updatedAt: new Date().toISOString() };
  return mem.campaigns[i];
}
export async function deleteCampaign(id: string) {
  mem.campaigns = mem.campaigns.filter(c => c.id !== id);
  return true;
}

/* ------------------------- FEATURED PRODUCTS ----------------------------- */
export async function getFeatured(): Promise<FeaturedConfig> {
  return { ...mem.featured, ids: [...mem.featured.ids] };
}
export async function setFeatured(ids: number[]): Promise<FeaturedConfig> {
  // valida ids com base no repositório de produtos
  const prods = await listProducts();
  const validSet = new Set(prods.map(p => Number(p.id)));
  const filtered = ids.filter(id => validSet.has(Number(id)));
  mem.featured = { ids: filtered, updatedAt: new Date().toISOString() };
  return getFeatured();
}
