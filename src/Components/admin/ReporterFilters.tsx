import type { FC } from "react";
import { Calendar } from "lucide-react";
import type { DateRange } from "@utils/reporting";

type Preset = "7d" | "30d" | "month";

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  preset?: Preset;
  onPresetChange?: (p: Preset) => void;
};

function toISOInput(d: Date) {
  const dt = new Date(d);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0, 10);
}

const ReporterFilters: FC<Props> = ({ value, onChange, preset, onPresetChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <div className="inline-flex items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-500" />
        <input
          type="date"
          aria-label="Data inicial"
          className="rounded-md ring-1 ring-slate-200 bg-white px-2 py-1.5 text-sm outline-none"
          value={toISOInput(value.from)}
          onChange={(e) => {
            const from = new Date(e.target.value);
            const to = value.to;
            onChange({ from, to });
          }}
        />
        <span className="text-slate-500 text-sm">até</span>
        <input
          type="date"
          aria-label="Data final"
          className="rounded-md ring-1 ring-slate-200 bg-white px-2 py-1.5 text-sm outline-none"
          value={toISOInput(value.to)}
          onChange={(e) => {
            const to = new Date(e.target.value);
            const from = value.from;
            onChange({ from, to });
          }}
        />
      </div>

      <div className="inline-flex gap-2">
        {(["7d", "30d", "month"] as Preset[]).map((p) => (
          <button
            key={p}
            type="button"
            className={`px-3 py-1.5 text-sm rounded-md ring-1 transition
              ${preset === p ? "bg-blue-600 text-white ring-blue-600" : "bg-white ring-slate-200 hover:bg-slate-50"}`}
            onClick={() => onPresetChange?.(p)}
          >
            {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "Este mês"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReporterFilters;
