import { useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { useGetAllPublicShopsQuery } from "../../auth/authApi";
import { isShopInFavorites } from "../../favorites/favoriteUtils";
import { useFavoriteShopLookup } from "../../favorites/useFavoriteShopLookup";
import { WorkshopCard } from "./WorkshopCard";

const sortOptions = ["التقييمات", "السعر", "المسافة", "التقييم"] as const;
const EMPTY_SHOPS: never[] = [];

export function WorkshopsResultsSection() {
  const [activeSort, setActiveSort] = useState<(typeof sortOptions)[number]>("التقييمات");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError, isFetching } = useGetAllPublicShopsQuery();
  const { lookup: favoriteLookup } = useFavoriteShopLookup();
  const shops = data?.data ?? EMPTY_SHOPS;
  const totalWorkshops = shops.length;

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
    <div className="min-w-0 flex-1">
      {isFetching ? (
        <p className="mb-4 text-xs text-primary/70" role="status">
          جاري تحديث القائمة...
        </p>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-primary">{totalWorkshops} ورشة</span>
          <span className="mx-1 text-gray-400">·</span>
          في كل المدن
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">ترتيب حسب:</span>
            <div className="flex flex-wrap gap-1">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setActiveSort(option)}
                  className={`rounded-md px-3 py-1.5 text-xs transition ${
                    activeSort === option
                      ? "bg-primary text-white"
                      : "border border-gray-200 text-gray-600 hover:border-primary/30"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex overflow-hidden rounded-md border border-gray-200">
            <button
              type="button"
              aria-label="عرض شبكي"
              onClick={() => setViewMode("grid")}
              className={`flex h-8 w-9 items-center justify-center transition ${
                viewMode === "grid" ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              aria-label="عرض قائمة"
              onClick={() => setViewMode("list")}
              className={`flex h-8 w-9 items-center justify-center border-s border-gray-200 transition ${
                viewMode === "list" ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
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
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-4"
          }
        >
          {shops.map((shop) => (
            <WorkshopCard key={shop.id} shop={shop} isFavorite={isShopInFavorites(shop, favoriteLookup)} />
          ))}
        </div>
      )}

      {totalWorkshops > 0 ? (
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            عرض {totalWorkshops} من {totalWorkshops} ورشة
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="الصفحة السابقة"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm text-white"
            >
              {currentPage}
            </button>
            <button
              type="button"
              aria-label="الصفحة التالية"
              disabled
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
