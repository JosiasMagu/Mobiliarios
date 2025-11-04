import { useEffect, useMemo, useRef, useState } from "react";

const PLACEHOLDER = "/assets/placeholder.jpg";
function resolveImg(u?: string) {
  if (!u) return PLACEHOLDER;
  const s = String(u).trim();
  if (!s) return PLACEHOLDER;
  if (/^https?:\/\//i.test(s)) return `/api/img?url=${encodeURIComponent(s)}`;
  if (s.startsWith("/")) return s;
  if (s.startsWith("assets/")) return `/${s}`;
  return `/assets/${s}`;
}

export default function HomeCarousel({ images }: { images: string[] }) {
  const list = useMemo(() => images.filter(Boolean).map(resolveImg), [images]);
  const [i, setI] = useState(0);
  const t = useRef<number | null>(null);

  useEffect(() => {
    if (!list.length) return;
    t.current = window.setInterval(() => setI((x) => (x + 1) % list.length), 3000);
    return () => { if (t.current) window.clearInterval(t.current); };
  }, [list.length]);

  const cur = list[i];

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-2xl bg-slate-100">
      {cur ? (
        <img
          key={cur}
          src={cur}
          alt="Destaques"
          className="w-full h-full object-cover transition-opacity duration-700"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
        />
      ) : (
        <div className="w-full h-full" />
      )}
      {list.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {Array.from({ length: Math.min(list.length, 8) }).map((_, k) => (
            <span key={k} className={`h-1.5 w-1.5 rounded-full ${k === (i % 8) ? "bg-white" : "bg-white/60"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
