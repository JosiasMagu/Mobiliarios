import { Eye, Play, Sparkles } from "lucide-react";

export function Hero({ smoothScrollTo }: { smoothScrollTo: (id: string) => void }) {
  return (
    <section
      id="home"
      className="
        mt-3               /* pequeno respiro abaixo da navbar */
        mb-10 md:mb-14     /* espaço abaixo do hero, 'baixar' visualmente a dobra */
        h-[420px] md:h-[560px] w-full rounded-2xl overflow-hidden
        bg-center bg-cover relative
      "
      style={{
        // use uma imagem em public/hero/cover.(jpg|webp|png) se puder.
        // Mantive fallback visual caso a imagem falhe (o gradiente cobre).
        backgroundImage:
          "linear-gradient(to bottom, rgba(0,0,0,.25), rgba(0,0,0,.35)), url('/hero/cover.jpg')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {/* overlay extra para contraste em qualquer imagem */}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
        <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs mb-4">
          <Sparkles className="w-4 h-4" /> Lançamento
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white/90">
          Design que eleva o seu espaço
        </h1>

        <p className="mt-3 text-base md:text-lg text-white/85">
          Peças assinadas, conforto e funcionalidade — entregues com cuidado.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => smoothScrollTo("products")}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            <Eye className="w-5 h-5" /> Ver Coleção
          </button>

          <button
            onClick={() => smoothScrollTo("features")}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-white ring-1 ring-white/30 hover:bg-white/20"
          >
            <Play className="w-5 h-5" /> Como Funciona
          </button>
        </div>
      </div>
    </section>
  );
}
