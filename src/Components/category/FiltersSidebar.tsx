
  const COLOR_SWATCHES = ["#ffffff", "#111827", "#1e3a8a", "#dc2626", "#22c55e", "#f59e0b"] as const;

  export function FiltersSidebar(props: {
    q: string; setQ: (v: string) => void;
    min: string; setMin: (v: string) => void;
    max: string; setMax: (v: string) => void;
    inStock: boolean; setInStock: (v: boolean) => void;
    color: string | null; setColor: (v: string | null) => void;
    material: string | null; setMaterial: (v: string | null) => void;
    setPage: (n: number) => void;
    setPriceRange: (r: "r1" | "r2" | "r3" | "r4" | null) => void;
    resetFilters: () => void;
  }) {
    return (
      <aside className="w-full lg:w-1/4">
        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>

        {/* Busca */}
        <div className="mt-4">
          <input
            value={props.q}
            onChange={(e) => { props.setQ(e.target.value); props.setPage(1); }}
            placeholder="Pesquisar por nome"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="mt-4 space-y-6">
          {/* Preço */}
          <div>
            <h3 className="text-base font-medium text-gray-900">Preço</h3>
            <div className="mt-2 space-y-2">
              {[
                { id: "r1", label: "Até 500" },
                { id: "r2", label: "500 – 1.000" },
                { id: "r3", label: "1.000 – 2.000" },
                { id: "r4", label: "Acima de 2.000" },
                { id: "r0", label: "Todos" },
              ].map(opt => (
                <label key={opt.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="price"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={() => props.setPriceRange(opt.id === "r0" ? null : (opt.id as any))}
                  />
                  <span className="text-sm text-gray-600">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                type="number" inputMode="decimal" placeholder="Min"
                value={props.min}
                onChange={(e) => { props.setMin(e.target.value); props.setPage(1); }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number" inputMode="decimal" placeholder="Max"
                value={props.max}
                onChange={(e) => { props.setMax(e.target.value); props.setPage(1); }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Cor */}
          <div>
            <h3 className="text-base font-medium text-gray-900">Cor</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {COLOR_SWATCHES.map((hex) => {
                const selected = props.color?.toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={hex}
                    aria-label={`Cor ${hex}`}
                    className={`h-8 w-8 rounded-full border-2 ${selected ? "ring-2 ring-blue-500 border-transparent" : "border-transparent hover:border-gray-400"}`}
                    style={{ backgroundColor: hex }}
                    onClick={() => { props.setColor(selected ? null : hex); props.setPage(1); }}
                  />
                );
              })}
            </div>
          </div>

          {/* Material (placeholder) */}
          <div>
            <h3 className="text-base font-medium text-gray-900">Material</h3>
            <div className="mt-2 space-y-2">
              {["Tecido", "Couro", "Veludo"].map((m) => (
                <label key={m} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={props.material === m}
                    onChange={(e) => { props.setMaterial(e.target.checked ? m : null); props.setPage(1); }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">{m}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={props.inStock}
                onChange={(e) => { props.setInStock(e.target.checked); props.setPage(1); }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Em estoque
            </label>
            <div className="mt-3">
              <button
                onClick={props.resetFilters}
                className="text-sm px-3 py-2 rounded-md border hover:bg-gray-50"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        </div>
      </aside>
    );
  }
