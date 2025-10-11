import { ArrowRight, Shield, Truck, Zap } from "lucide-react";

export function Features() {
  const items = [
    { icon: Truck, title: "Entrega Rápida", desc: "Maputo e região com prazos curtos." },
    { icon: Shield, title: "Compra Segura", desc: "Garantia estendida e proteção." },
    { icon: Zap,   title: "Suporte Ágil",  desc: "Atendimento humano e resolutivo." }
  ];
  return (
    <section id="features" className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center">Por que escolher a Mobiliário?</h2>
        <p className="text-slate-600 text-center mt-2">Experiência simples, suporte humano e qualidade de ponta.</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((F, i) => (
            <div key={i} className="rounded-xl border p-6 hover:shadow-sm transition">
              <F.icon className="w-7 h-7 text-blue-600" />
              <h3 className="mt-3 font-semibold">{F.title}</h3>
              <p className="text-sm text-slate-600">{F.desc}</p>
              <button className="mt-4 inline-flex items-center gap-2 text-sm text-blue-700 hover:underline">
                Saiba mais <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
