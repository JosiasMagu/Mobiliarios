import { Shield, Truck, Zap } from "lucide-react";

export function TrustBar() {
  return (
    <section className="py-10 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6" />
          <div>
            <div className="font-semibold">Entrega Rastreada</div>
            <div className="text-sm text-white/80">Envio ágil para sua cidade</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6" />
          <div>
            <div className="font-semibold">Compra Segura</div>
            <div className="text-sm text-white/80">Pagamento local e proteção</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6" />
          <div>
            <div className="font-semibold">Suporte Rápido</div>
            <div className="text-sm text-white/80">Atendimento humano</div>
          </div>
        </div>
      </div>
    </section>
  );
}
