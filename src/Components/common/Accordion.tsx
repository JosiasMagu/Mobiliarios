// src/Components/common/Accordion.tsx
import type { ReactNode } from "react";

type AccordionItemProps = {
  title: string;
  children: ReactNode;
};

export function AccordionItem({ title, children }: AccordionItemProps) {
  return (
    <details className="rounded-lg border border-slate-200/40 bg-white p-3">
      <summary
        className="cursor-pointer list-none select-none font-medium text-slate-800
                   flex items-center justify-between"
      >
        <span>{title}</span>
        <span className="text-slate-400">▾</span>
      </summary>
      <div className="pt-2 text-sm text-slate-600">{children}</div>
    </details>
  );
}
