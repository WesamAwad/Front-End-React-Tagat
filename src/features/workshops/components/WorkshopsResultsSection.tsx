import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, List, MapPinned } from "lucide-react";
import { useGetAllPublicShopsQuery } from "../../auth/authApi";
import { isShopInFavorites } from "../../favorites/favoriteUtils";
import { useFavoriteShopLookup } from "../../favorites/useFavoriteShopLookup";
import { getPageSlice } from "../../../utils/getPageSlice";
import type { WorkshopsUiFilters } from "./WorkshopsFiltersSidebar";
import { WorkshopCard } from "./WorkshopCard";

const EMPTY_SHOPS: never[] = [];
const PAGE_SIZE = 9;

function visiblePageNumbers(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 3) return [1, 2, 3, 4, "ellipsis", total];
  if (current >= total - 2) return [1, "ellipsis", total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

type WorkshopsResultsSectionProps = {
  filters: WorkshopsUiFilters;
  mapSearchOpen: boolean;
  onToggleMapSearch: () => void;
};

function filtersKey(filters: WorkshopsUiFilters) {
  return [filters.name, filters.city_name, filters.status, filters.service_id, filters.price, filters.product_name, filters.rating, filters.verified_only].join("|");
}

export function WorkshopsResultsSection({ filters, mapSearchOpen, onToggleMapSearch }: WorkshopsResultsSectionProps) {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const activeFiltersKey = filtersKey(filters);
  const [pageState, setPageState] = useState({ key: activeFiltersKey, page: 1 });
  const requestedPage = pageState.key === activeFiltersKey ? pageState.page : 1;

  const { data, isLoading, isError, isFetching } = useGetAllPublicShopsQuery({
    name: filters.name,
    city_name: filters.city_name,
    status: filters.status,
    service_id: filters.service_id,
    price: filters.price,
    product_name: filters.product_name,
    rating: filters.rating,
    is_verified: filters.verified_only ? 1 : null,
  });
  const { lookup: favoriteLookup } = useFavoriteShopLookup();

  const shops = data?.data ?? EMPTY_SHOPS;
  const totalWorkshops = shops.length;
  const { pageItems, currentPage, totalPages } = getPageSlice(shops, requestedPage, PAGE_SIZE);
  const rangeStart = totalWorkshops === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = rangeStart + pageItems.length - 1;

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(1, page), totalPages);
    setPageState({ key: activeFiltersKey, page: nextPage });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  const filterHints = [
    filters.name ? `اسم: ${filters.name}` : null,
    filters.city_name || "كل المدن",
    filters.status === "open" ? "مفتوح الآن" : null,
    filters.verified_only ? "موثّقة فقط" : null,
    filters.service_id != null ? "خدمة محددة" : null,
    filters.product_name ? `قطعة: ${filters.product_name}` : null,
    filters.rating == null ? null : `تقييم ${filters.rating}+`,
    filters.price != null ? `سعر ${filters.price} ر.س` : null,
  ].filter(Boolean);

  if (isLoading) {
    return (
      <div className="min-w-0 flex-1 rounded-xl border border-primary/10 bg-white px-6 py-12 text-center">
        <p className="text-sm text-primary/70" role="status">
          جاري تحميل الورش...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-w-0 flex-1 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center" role="alert">
        <p className="text-sm font-medium text-red-700">تعذر تحميل الورش</p>
        <p className="mt-1 text-xs text-red-600">حاول تحديث الصفحة أو المحاولة لاحقاً.</p>
      </div>
    );
  }

  return (
    <div ref={resultsRef} className="min-w-0 flex-1">
      {isFetching ? (
        <p className="mb-4 text-xs text-primary/70" role="status">
          جاري تحديث القائمة...
        </p>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-primary">{totalWorkshops} ورشة</span>
          <span className="mx-1 text-gray-400">·</span>
          {filterHints.join(" · ")}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onToggleMapSearch}
            aria-pressed={mapSearchOpen}
            aria-controls="workshops-map-search"
            className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 ${
              mapSearchOpen
                ? "bg-primary text-white shadow-primary/25 hover:bg-primary-hover"
                : "bg-secondary text-white shadow-secondary/30 hover:bg-secondary-hover hover:shadow-lg hover:shadow-secondary/35"
            }`}
          >
            <MapPinned className="size-4 shrink-0" aria-hidden="true" />
            {mapSearchOpen ? "إخفاء الخريطة" : "البحث عبر الخريطة"}
          </button>

          <div className="flex overflow-hidden rounded-md border border-gray-200">
            <button
              type="button"
              aria-label="عرض شبكي"
              onClick={() => setViewMode("grid")}
              className={`flex h-8 w-9 items-center justify-center transition ${viewMode === "grid" ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              aria-label="عرض قائمة"
              onClick={() => setViewMode("list")}
              className={`flex h-8 w-9 items-center justify-center border-s border-gray-200 transition ${viewMode === "list" ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {shops.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">لا توجد ورش متاحة حالياً</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
          {pageItems.map((shop) => (
            <WorkshopCard key={shop.id} shop={shop} isFavorite={isShopInFavorites(shop, favoriteLookup)} />
          ))}
        </div>
      )}

      {totalWorkshops > 0 ? (
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            عرض {rangeStart}–{rangeEnd} من {totalWorkshops} ورشة
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="الصفحة السابقة"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
            {visiblePageNumbers(currentPage, totalPages).map((page, index) =>
              page === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-1 text-sm text-gray-400" aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  aria-label={`الصفحة ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                  onClick={() => goToPage(page)}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition ${
                    page === currentPage ? "bg-primary text-white" : "border border-gray-200 text-gray-600 hover:border-primary/30"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="الصفحة التالية"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
