import type { FC } from "react";
import type { LoyaltyTier } from "@repo/marketing.repository";

type Props = {
  data: LoyaltyTier[];
  onSave: (t: LoyaltyTier) => void;
  onDelete: (id: string) => void;
};

const LoyaltyPanel: FC<Props> = ({ data, onSave, onDelete }) => {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold">Programa de Fidelidade</div>
        <button
          className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2"
          onClick={() => onSave({ id: "", name: "Novo Nível", minSpend: 0, perk: "" } as LoyaltyTier)}
        >
          Novo Nível
        </button>
      </div>
      <div className="grid gap-3">
  {data.map((t, _idx) => (
          <div key={t.id} className="grid sm:grid-cols-4 gap-2 items-center rounded-lg ring-1 ring-slate-200 p-3">
            <input
              defaultValue={t.name}
              onChange={(e)=> (t.name = e.target.value)}
              className="rounded-md ring-1 ring-slate-200 px-2 py-1.5 text-sm outline-none"
              placeholder="Nome do nível"
            />
            <input
              type="number"
              defaultValue={t.minSpend}
              onChange={(e)=> (t.minSpend = Number(e.target.value || 0))}
              className="rounded-md ring-1 ring-slate-200 px-2 py-1.5 text-sm outline-none"
              placeholder="Gasto mínimo"
            />
            <input
              defaultValue={t.perk}
              onChange={(e)=> (t.perk = e.target.value)}
              className="rounded-md ring-1 ring-slate-200 px-2 py-1.5 text-sm outline-none"
              placeholder="Benefício"
            />
            <div className="flex items-center justify-end gap-2">
              <button className="px-2 py-1 rounded-md ring-1 ring-slate-200 text-xs hover:bg-slate-50" onClick={()=>onSave(t)}>Guardar</button>
              <button className="px-2 py-1 rounded-md ring-1 ring-rose-200 text-xs text-rose-700 hover:bg-rose-50" onClick={()=>onDelete(t.id)}>Excluir</button>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="text-sm text-slate-500">Sem níveis configurados.</div>}
      </div>
    </div>
  );
};
export default LoyaltyPanel;
