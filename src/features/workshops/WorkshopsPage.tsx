import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { WorkshopsBrowseSection } from "./WorkshopsBrowseSection";
import type { WorkshopsUiFilters } from "./components/WorkshopsFiltersSidebar";
import { WorkshopsHeroSection } from "./WorkshopsHeroSection";

const WorkshopsMapSearch = lazy(() =>
  import("./components/WorkshopsMapSearch").then((module) => ({ default: module.WorkshopsMapSearch })),
);

const INITIAL_FILTERS: WorkshopsUiFilters = {
  name: null,
  city_name: null,
  status: null,
  service_id: null,
  price: null,
  product_name: null,
  rating: null,
  verified_only: false,
};

function WorkshopsPage() {
  const [filters, setFilters] = useState<WorkshopsUiFilters>(INITIAL_FILTERS);
  const [mapSearchOpen, setMapSearchOpen] = useState(false);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapSearchOpen) return;
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [mapSearchOpen]);

  return (
    <div>
      <nav aria-label="مسار الصفحة" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <ol className="flex items-center gap-2 text-xs">
          <li>
            <Link to="/" className="text-primary transition hover:text-primary">
              الرئيسية
            </Link>
          </li>
          <li className="text-[#ccc]" aria-hidden="true">
            /
          </li>
          <li className="font-bold text-secondary" aria-current="page">
            الورشات
          </li>
        </ol>
      </nav>

      <WorkshopsHeroSection name={filters.name} onSearch={(name) => setFilters((prev) => ({ ...prev, name }))} />

      {mapSearchOpen ? (
        <div ref={mapSectionRef} id="workshops-map-search" className="mt-8 scroll-mt-24">
          <Suspense
            fallback={
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-72 items-center justify-center rounded-xl border border-primary/10 bg-primary-light/30 text-sm text-primary/70 sm:h-96" role="status">
                  جاري تحميل الخريطة...
                </div>
              </div>
            }
          >
            <WorkshopsMapSearch />
          </Suspense>
        </div>
      ) : null}

      <WorkshopsBrowseSection
        filters={filters}
        onFiltersChange={setFilters}
        mapSearchOpen={mapSearchOpen}
        onToggleMapSearch={() => setMapSearchOpen((open) => !open)}
      />
    </div>
  );
}

export default WorkshopsPage;
