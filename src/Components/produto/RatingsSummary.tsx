import { Stars } from "@utils/rating";

export function RatingsSummary({ rating, reviews }: { rating: number; reviews: number }) {
  const dist = [
    { s: 5, p: 0.4 },
    { s: 4, p: 0.3 },
    { s: 3, p: 0.15 },
    { s: 2, p: 0.1 },
    { s: 1, p: 0.05 },
  ];
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <section className="mt-16 rounded-lg border border-gray-200 bg-white p-6 lg:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Avaliações de Clientes</h2>

      <div className="mt-6 flex flex-wrap items-center gap-8">
        <div className="flex flex-col items-center">
          <p className="text-5xl font-bold text-gray-900">{rating.toFixed(1)}</p>
          <div className="mt-1"><Stars rating={rating} /></div>
          <p className="mt-2 text-sm text-gray-500">Baseado em {reviews} avaliações</p>
        </div>

        <div className="flex-1 min-w-[260px]">
          <div className="space-y-2">
            {dist.map((d) => (
              <div key={d.s} className="flex items-center gap-2">
                <span className="w-4 text-sm font-medium text-gray-700">{d.s}</span>
                <div className="h-2 flex-1 rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-yellow-400" style={{ width: pct(d.p) }} />
                </div>
                <span className="w-10 text-right text-sm text-gray-500">{pct(d.p)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
