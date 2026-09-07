import { Link } from "react-router-dom";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useGetAllPublicShopsQuery } from "../auth/authApi";
import { isShopInFavorites } from "../favorites/favoriteUtils";
import { useFavoriteShopLookup } from "../favorites/useFavoriteShopLookup";
import { WorkshopCard } from "../workshops/components/WorkshopCard";

const EMPTY_SHOPS: never[] = [];

export function NearbyWorkshopsSection() {
  const { data, isLoading, isError } = useGetAllPublicShopsQuery();
  const { lookup: favoriteLookup } = useFavoriteShopLookup();
  const workshops = (data?.data ?? EMPTY_SHOPS).slice(0, 3);

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

      {isLoading ? (
        <p className="text-center text-sm text-primary/70" role="status">
          جاري تحميل الورش...
        </p>
      ) : isError ? (
        <p className="text-center text-sm text-red-600" role="alert">
          تعذر تحميل الورش القريبة.
        </p>
      ) : workshops.length === 0 ? (
        <p className="text-center text-sm text-gray-500">لا توجد ورش متاحة حالياً.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map((shop) => (
            <WorkshopCard key={shop.id} shop={shop} isFavorite={isShopInFavorites(shop, favoriteLookup)} />
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/workshops" className="text-sm font-medium text-secondary transition hover:text-secondary-hover">
          عرض جميع الورش
        </Link>
      </div>
    </section>
  );
}
