import React from "react";
import type { SortKey } from "@controller/Loja/category.controller";

export function SortBar(props: {
  info: string;
  sort: SortKey;
  setSort: (s: SortKey) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
      <p className="text-sm text-gray-600">{props.info}</p>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="sort">Ordenar por:</label>
        <select
          id="sort"
          value={props.sort}
          onChange={(e) => props.setSort(e.target.value as SortKey)}
          className="rounded-md border-gray-300 py-2 pl-3 pr-8 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="bestsellers">Mais Vendidos</option>
          <option value="newest">Novidades</option>
          <option value="priceAsc">Preço: Crescente</option>
          <option value="priceDesc">Preço: Decrescente</option>
        </select>
      </div>
    </div>
  );
}
