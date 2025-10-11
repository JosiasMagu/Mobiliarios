import React, { useState } from "react";

type Props = { images: string[] };

export function Gallery({ images }: Props) {
  const safe = images.length ? images : ["/placeholder.jpg"];
  const [current, setCurrent] = useState(0);

  return (
    <div className="grid gap-3 lg:grid-cols-[80px_1fr]">
      {/* Thumbs desktop */}
      <div className="hidden lg:flex lg:flex-col lg:gap-3">
        {safe.slice(0, 6).map((src, i) => {
          const active = i === current;
          return (
            <button
              key={src + i}
              onClick={() => setCurrent(i)}
              className={`relative overflow-hidden rounded-lg border border-slate-200/40 bg-slate-50 aspect-square h-20 w-20 transition-colors ${active ? "ring-2 ring-blue-600" : "hover:border-slate-300/60"}`}
              aria-label={`Imagem ${i + 1}`}
            >
              <img
                src={src}
                alt={`Miniatura ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy" decoding="async" fetchPriority="low"
                srcSet={`${src}?w=160 160w, ${src}?w=320 320w`}
                sizes="80px"
              />
            </button>
          );
        })}
      </div>

      {/* Principal + thumbs mobile */}
      <div>
        <div className="overflow-hidden rounded-xl border border-slate-200/40 bg-slate-50 shadow-sm">
          <img
            src={safe[current]}
            alt="Imagem do produto"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            loading="eager" decoding="async" fetchPriority="high"
            srcSet={`${safe[current]}?w=640 640w, ${safe[current]}?w=960 960w, ${safe[current]}?w=1200 1200w`}
            sizes="(max-width: 1024px) 90vw, 600px"
          />
        </div>

        {/* Thumbs mobile */}
        <div className="mt-3 grid grid-cols-4 gap-2 lg:hidden">
          {safe.slice(0, 8).map((src, i) => {
            const active = i === current;
            return (
              <button
                key={src + i}
                onClick={() => setCurrent(i)}
                className={`overflow-hidden rounded-lg border border-slate-200/40 bg-slate-50 aspect-square transition-colors ${active ? "ring-2 ring-blue-600" : "hover:border-slate-300/60"}`}
                aria-label={`Imagem ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`Miniatura ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy" decoding="async"
                  srcSet={`${src}?w=160 160w, ${src}?w=320 320w`}
                  sizes="22vw"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
