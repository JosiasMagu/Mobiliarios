import { useEffect, useState } from "react";
import {
  listCoupons, createCoupon, updateCoupon, deleteCoupon,
  listTiers, upsertTier, deleteTier,
  listCampaigns, createCampaign, updateCampaign, deleteCampaign,
} from "@repo/marketing.repository";
import type { Coupon, LoyaltyTier, Campaign } from "@repo/marketing.repository";
import CouponTable from "@comp/admin/CuponTable";
import CouponFormDialog from "@comp/admin/CuponFormDialog";
import LoyaltyPanel from "@comp/admin/LoyaltyPanel";
import EmailCampaignsPanel from "@comp/admin/EmailCampaignsPanel";
import FeaturedProductsPanel from "@comp/admin/FeaturedProductsPanel";

export default function MarketingPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  async function refresh() {
    const [cs, ts, cms] = await Promise.all([listCoupons(), listTiers(), listCampaigns()]);
    setCoupons(cs); setTiers(ts); setCampaigns(cms);
  }
  useEffect(() => { refresh(); }, []);

  return (
    <div className="grid gap-6">
      {/* Cupons */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">Gestão de Marketing</div>
        <button
          className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2"
          onClick={() => { setEditing(null); setOpenForm(true); }}
        >
          Novo Cupom
        </button>
      </div>

      <CouponTable
        data={coupons}
        onEdit={(c) => { setEditing(c); setOpenForm(true); }}
        onDelete={async (id) => { await deleteCoupon(id); refresh(); }}
      />

      {openForm && (
        <CouponFormDialog
          open={openForm}
          initial={editing ?? undefined}
          onClose={() => setOpenForm(false)}
          onSubmit={async (payload) => {
            if (editing) await updateCoupon(editing.id, payload as Partial<Coupon>);
            else await createCoupon(payload);
            setOpenForm(false);
            refresh();
          }}
        />
      )}

      {/* Fidelidade */}
      <LoyaltyPanel
        data={tiers}
        onSave={async (t) => { await upsertTier(t.id ? t : { ...t, id: undefined }); refresh(); }}
        onDelete={async (id) => { await deleteTier(id); refresh(); }}
      />

      {/* Campanhas */}
      <EmailCampaignsPanel
        data={campaigns}
        onCreate={async (c) => { await createCampaign(c); refresh(); }}
        onUpdate={async (id, p) => { await updateCampaign(id, p); refresh(); }}
        onDelete={async (id) => { await deleteCampaign(id); refresh(); }}
      />

      {/* Destaques */}
      <FeaturedProductsPanel />
    </div>
  );
}
