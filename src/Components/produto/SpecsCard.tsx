import React from "react";

export function SpecsCard({ inStock }: { inStock: boolean }) {
  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5 lg:p-6">
      <h2 className="text-lg font-semibold text-gray-900">Informações Adicionais</h2>
      <dl className="mt-4 space-y-4 text-sm">
        <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
          <dt className="font-medium text-gray-500">Medidas</dt>
          <dd className="col-span-2 text-gray-700">280cm (L) × 160cm (P) × 85cm (A)</dd>
        </div>
        <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
          <dt className="font-medium text-gray-500">Dimensões</dt>
          <dd className="col-span-2 text-gray-700">Módulos: 80cm × 80cm × 85cm</dd>
        </div>
        <div className="grid grid-cols-3 gap-2 border-b border-gray-200 pb-3">
          <dt className="font-medium text-gray-500">Materiais</dt>
          <dd className="col-span-2 text-gray-700">Madeira maciça, tecido poliéster, espuma alta densidade</dd>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <dt className="font-medium text-gray-500">Disponibilidade</dt>
          <dd className={`col-span-2 font-semibold ${inStock ? "text-emerald-600" : "text-rose-600"}`}>
            {inStock ? "Em estoque" : "Indisponível"}
          </dd>
        </div>

        <div className="grid grid-cols-3 items-center gap-2 pt-4">
          <dt className="font-medium text-gray-500">Entrega</dt>
          <dd className="col-span-2">
            <div className="flex gap-2">
              <input
                className="form-input flex-1 rounded-md border-gray-300 text-sm focus:border-blue-600 focus:ring-blue-600"
                placeholder="Digite a sua Av."
              />
              <button className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
                Calcular
              </button>
            </div>
          </dd>
        </div>
      </dl>
    </div>
  );
}
