import { useEffect, useState } from "react";
import { listProducts } from "@repo/product.repository";
import { getFeatured, setFeatured } from "@repo/marketing.repository";
import type { Product } from "@model/product.model";

export default function FeaturedProductsPanel() {
  const [all, setAll] = useState<Product[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [prods, cfg] = await Promise.all([listProducts(), getFeatured()]);
      setAll(prods);
      setSelected(cfg.ids);
    })();
  }, []);

  const toggle = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold">Produtos em Destaque</div>
        <button
          disabled={saving}
          onClick={async ()=>{
            setSaving(true);
            await setFeatured(selected);
            setSaving(false);
          }}
          className="rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-3 py-2"
        >
          {saving ? "Guardando..." : "Guardar seleção"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {all.map(p => (
          <label key={p.id} className={`flex items-center gap-3 rounded-lg ring-1 ring-slate-200 p-3 cursor-pointer ${selected.includes(p.id) ? "bg-blue-50 ring-blue-200" : "bg-white"}`}>
            <input
              type="checkbox"
              checked={selected.includes(p.id)}
              onChange={()=>toggle(p.id)}
            />
            <div className="min-w-0">
              <div className="font-medium text-sm line-clamp-1">{p.name}</div>
              <div className="text-xs text-slate-500">{p.categoryName ?? p.categorySlug ?? "-"}</div>
            </div>
          </label>
        ))}
        {all.length === 0 && <div className="text-sm text-slate-500">Sem produtos cadastrados.</div>}
      </div>
    </div>
  );
}
