// src/Repository/marketing.repository.ts
import { httpGet, httpPost, httpPatch, httpDelete, httpPut } from "@/Utils/api";
import { listProducts } from "@repo/product.repository";

export type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder?: number;
  maxUses?: number;
  used?: number;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type LoyaltyTier = {
  id: string;
  name: string;
  minSpend: number;
  perk: string;
};

export type Campaign = {
  id: string;
  name: string;
  provider?: "mailchimp" | "sendgrid" | "custom";
  externalId?: string;
  subject: string;
  audience: "all" | "customers" | "guests";
  status: "draft" | "scheduled" | "sent";
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type FeaturedConfig = { ids: number[]; updatedAt: string };

// ---- COUPONS ----
export async function listCoupons(): Promise<Coupon[]> {
  return await httpGet<Coupon[]>("/api/admin/marketing/coupons");
}
export async function createCoupon(input: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "used">) {
  return await httpPost<Coupon>("/api/admin/marketing/coupons", input);
}
export async function updateCoupon(id: string, patch: Partial<Coupon>) {
  return await httpPatch<Coupon>(`/api/admin/marketing/coupons/${id}`, patch);
}
export async function deleteCoupon(id: string) {
  await httpDelete(`/api/admin/marketing/coupons/${id}`);
  return true;
}

// ---- TIERS ----
export async function listTiers(): Promise<LoyaltyTier[]> {
  return await httpGet<LoyaltyTier[]>("/api/admin/marketing/tiers");
}
export async function upsertTier(t: Omit<LoyaltyTier, "id"> & { id?: string }) {
  return await httpPut<LoyaltyTier>("/api/admin/marketing/tiers", t);
}
export async function deleteTier(id: string) {
  await httpDelete(`/api/admin/marketing/tiers/${id}`);
  return true;
}

// ---- CAMPAIGNS ----
export async function listCampaigns(): Promise<Campaign[]> {
  return await httpGet<Campaign[]>("/api/admin/marketing/campaigns");
}
export async function createCampaign(input: Omit<Campaign, "id" | "createdAt" | "updatedAt">) {
  return await httpPost<Campaign>("/api/admin/marketing/campaigns", input);
}
export async function updateCampaign(id: string, patch: Partial<Campaign>) {
  return await httpPatch<Campaign>(`/api/admin/marketing/campaigns/${id}`, patch);
}
export async function deleteCampaign(id: string) {
  await httpDelete(`/api/admin/marketing/campaigns/${id}`);
  return true;
}

// ---- FEATURED ----
export async function getFeatured(): Promise<FeaturedConfig> {
  return await httpGet<FeaturedConfig>("/api/admin/marketing/featured");
}
export async function setFeatured(ids: number[]): Promise<FeaturedConfig> {
  const prods = await listProducts();
  const valid = new Set(prods.map((p) => Number(p.id)));
  const filtered = ids.filter((id) => valid.has(Number(id)));
  return await httpPut<FeaturedConfig>("/api/admin/marketing/featured", { ids: filtered });
}
