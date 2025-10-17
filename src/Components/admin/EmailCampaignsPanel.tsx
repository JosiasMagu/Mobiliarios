import type { FC } from "react";
import type { Campaign } from "@repo/marketing.repository";

type Props = {
  data: Campaign[];
  onCreate: (c: Omit<Campaign, "id" | "createdAt" | "updatedAt">) => void;
  onUpdate: (id: string, patch: Partial<Campaign>) => void;
  onDelete: (id: string) => void;
};

function CampaignRow({ c, onUpdate, onDelete }: { c: Campaign; onUpdate: Props["onUpdate"]; onDelete: Props["onDelete"] }) {
  return (
    <tr className="border-t border-slate-200/60">
      <td className="px-3 py-2">{c.name}</td>
      <td className="px-3 py-2">{c.subject}</td>
      <td className="px-3 py-2">{c.provider ?? "-"}</td>
      <td className="px-3 py-2">{c.audience}</td>
      <td className="px-3 py-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ring-1 ${
          c.status === "sent" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" :
          c.status === "scheduled" ? "bg-amber-50 text-amber-700 ring-amber-100" :
          "bg-slate-100 text-slate-700 ring-slate-200"
        }`}>
          {c.status}
        </span>
      </td>
      <td className="px-3 py-2 text-right">
        <div className="inline-flex gap-2">
          {c.status !== "sent" && (
            <button onClick={()=>onUpdate(c.id, { status: "scheduled" })} className="px-2 py-1 rounded-md ring-1 ring-slate-200 text-xs hover:bg-slate-50">Agendar</button>
          )}
          <button onClick={()=>onDelete(c.id)} className="px-2 py-1 rounded-md ring-1 ring-rose-200 text-xs text-rose-700 hover:bg-rose-50">Excluir</button>
        </div>
      </td>
    </tr>
  );
}

const EmailCampaignsPanel: FC<Props> = ({ data, onCreate, onUpdate, onDelete }) => {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold">Campanhas de E-mail</div>
        <button
          className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2"
          onClick={() =>
            onCreate({
              name: "Nova campanha",
              subject: "Assunto da campanha",
              provider: "custom",
              audience: "all",
              status: "draft",
            })
          }
        >
          Nova Campanha
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-600 bg-slate-50">
            <tr>
              <th className="text-left px-3 py-2">Nome</th>
              <th className="text-left px-3 py-2">Assunto</th>
              <th className="text-left px-3 py-2">Provedor</th>
              <th className="text-left px-3 py-2">Público</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-right px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">Sem campanhas.</td></tr>
            )}
            {data.map(c => <CampaignRow key={c.id} c={c} onUpdate={onUpdate} onDelete={onDelete} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default EmailCampaignsPanel;
