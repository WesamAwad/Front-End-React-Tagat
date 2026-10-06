import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { WorkshopsFiltersSidebar, type WorkshopsUiFilters } from "./components/WorkshopsFiltersSidebar";
import { WorkshopsResultsSection } from "./components/WorkshopsResultsSection";

type WorkshopsBrowseSectionProps = {
  filters: WorkshopsUiFilters;
  onFiltersChange: (filters: WorkshopsUiFilters) => void;
  mapSearchOpen: boolean;
  onToggleMapSearch: () => void;
};

export function WorkshopsBrowseSection({ filters, onFiltersChange, mapSearchOpen, onToggleMapSearch }: WorkshopsBrowseSectionProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6" dir="ltr">
        <div className="order-1 lg:order-2 lg:w-68 lg:shrink-0" dir="rtl">
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((open) => !open)}
              aria-expanded={mobileFiltersOpen}
              aria-controls="workshops-mobile-filters"
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-primary shadow-sm transition hover:border-primary/20"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-secondary" aria-hidden="true" />
                تصفية النتائج
              </span>
              {mobileFiltersOpen ? <ChevronUp className="size-4 text-gray-400" aria-hidden="true" /> : <ChevronDown className="size-4 text-gray-400" aria-hidden="true" />}
            </button>

            {mobileFiltersOpen ? (
              <div id="workshops-mobile-filters" className="mt-3">
                <WorkshopsFiltersSidebar compact showHeader={false} filters={filters} onFiltersChange={onFiltersChange} />
              </div>
            ) : null}
          </div>

          <div className="hidden lg:block">
            <WorkshopsFiltersSidebar filters={filters} onFiltersChange={onFiltersChange} />
          </div>
        </div>

        <div className="order-2 min-w-0 flex-1 lg:order-1" dir="rtl">
          <WorkshopsResultsSection filters={filters} mapSearchOpen={mapSearchOpen} onToggleMapSearch={onToggleMapSearch} />
        </div>
      </div>
    </section>
  );
}
