import { Stars } from "@utils/rating";

type Review = {
  id: number;
  name: string;
  avatar: string;
  date: string;
  rating: number;
  text: string;
};

export function ReviewsList({ items }: { items: Review[] }) {
  if (!items?.length) return null;

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 lg:p-8">
      <div className="space-y-8 divide-y divide-gray-200">
        {items.map((r) => (
          <div key={r.id} className="pt-8 first:pt-0">
            <div className="flex items-start gap-4">
              <img src={r.avatar} alt={r.name} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900">{r.name}</h4>
                  <span className="text-xs text-gray-500">{r.date}</span>
                </div>
                <div className="mt-1"><Stars rating={r.rating} /></div>
                <p className="mt-2 text-sm text-gray-600">{r.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
