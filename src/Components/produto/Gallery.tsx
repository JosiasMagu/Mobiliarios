import React from "react";

const PLACEHOLDER = "/assets/placeholder.jpg";

function resolveImg(u?: string) {
  if (!u) return PLACEHOLDER;
  const s = String(u).trim();
  if (!s) return PLACEHOLDER;
  if (s.startsWith("data:") || s.startsWith("blob:")) return s;
  if (/^https?:\/\//i.test(s)) return `/api/img?url=${encodeURIComponent(s)}`;
  if (s.startsWith("/")) return s;
  if (s.startsWith("assets/")) return `/${s}`;
  return `/assets/${s}`;
}

type Props = { images: string[] };

export function Gallery({ images }: Props) {
  const safe = React.useMemo(() => {
    const list = (images ?? []).filter(Boolean).map(resolveImg);
    return list.length ? list : [PLACEHOLDER];
  }, [images]);

  const [current, setCurrent] = React.useState(0);
  const len = safe.length;

  // atalhos do teclado
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % len);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + len) % len);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [len]);

  return (
    <div className="grid gap-3 lg:grid-cols-[80px_1fr]">
      {/* thumbs desktop */}
      <div className="hidden lg:flex lg:flex-col lg:gap-3">
        {safe.slice(0, 8).map((src, i) => {
          const active = i === current;
          return (
            <button
              key={src + i}
              onClick={() => setCurrent(i)}
              className={`relative overflow-hidden rounded-lg border border-slate-200/40 bg-slate-50 aspect-square h-20 w-20 ${active ? "ring-2 ring-blue-600" : "hover:border-slate-300/60"}`}
              aria-label={`Imagem ${i + 1}`}
            >
              <img
                src={src}
                alt={`Miniatura ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
              />
            </button>
          );
        })}
      </div>

      {/* principal + thumbs mobile */}
      <div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200/40 bg-slate-50 shadow-sm">
          <img
            src={safe[current]}
            alt="Imagem do produto"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onClick={() => setCurrent((current + 1) % len)}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
          />

          {/* setas */}
          {len > 1 && (
            <>
              <button
                aria-label="Anterior"
                onClick={() => setCurrent((current - 1 + len) % len)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 shadow ring-1 ring-slate-200"
              >
                ‹
              </button>
              <button
                aria-label="Próxima"
                onClick={() => setCurrent((current + 1) % len)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 shadow ring-1 ring-slate-200"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* thumbs mobile */}
        <div className="mt-3 grid grid-cols-4 gap-2 lg:hidden">
          {safe.slice(0, 8).map((src, i) => {
            const active = i === current;
            return (
              <button
                key={src + i}
                onClick={() => setCurrent(i)}
                className={`overflow-hidden rounded-lg border border-slate-200/40 bg-slate-50 aspect-square ${active ? "ring-2 ring-blue-600" : "hover:border-slate-300/60"}`}
                aria-label={`Imagem ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`Miniatura ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
