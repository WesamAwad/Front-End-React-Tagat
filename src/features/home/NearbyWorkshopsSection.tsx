import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { WorkshopCard } from "../workshops/components/WorkshopCard";
import { mockWorkshops } from "../workshops/data/workshops.mock";

export function NearbyWorkshopsSection() {
  const workshops = mockWorkshops.slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">الأعلى تقييماً</p>
          <h2 className="mt-1 text-2xl font-bold text-primary">ورش قريبه منك</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 transition hover:border-primary/30"
          >
            <span>تصفية</span>
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 transition hover:border-primary/30"
          >
            <span>الرياض</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {workshops.map((workshop) => (
          <WorkshopCard key={workshop.id} workshop={workshop} />
        ))}
      </div>
    </section>
  );
}
