import type { Testimonial } from "@model/testimonial.model";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Stars } from "@utils/rating";

export function Testimonials({
  testimonials,
  current,
  setCurrent
}: {
  testimonials: Testimonial[];
  current: number;
  setCurrent: (i: number) => void;
}) {
  return (
    <section id="testimonials" className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">O que dizem nossos clientes</h2>
          <div className="flex gap-2">
            <button
              aria-label="Anterior"
              onClick={() => setCurrent((current - 1 + testimonials.length) % testimonials.length)}
              className="p-2 rounded-md border hover:bg-slate-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              aria-label="Seguinte"
              onClick={() => setCurrent((current + 1) % testimonials.length)}
              className="p-2 rounded-md border hover:bg-slate-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${current * 100}%)`, width: `${testimonials.length * 100}%` }}
          >
            {testimonials.map((t) => (
              <div key={t.id} className="w-full md:w-1/3 shrink-0 px-2">
                <div className="h-full rounded-xl border bg-white p-6">
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.location}</div>
                    </div>
                    {t.verified && (
                      <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        verificado
                      </span>
                    )}
                  </div>
                  <div className="mt-2"><Stars rating={t.rating} /></div>
                  <p className="text-slate-700 mt-3">{t.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full ${current === i ? "bg-blue-600" : "bg-slate-300"}`}
                aria-label={`Ir ao depoimento ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
