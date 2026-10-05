import { Link } from "react-router-dom";
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
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">الأعلى تقييماً</p>
          <h2 className="mt-1 text-2xl font-bold text-primary">ورش قريبه منك</h2>
        </div>
        <Link
          to="/workshops"
          className="shrink-0 text-sm font-medium text-secondary transition hover:text-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
        >
          عرض المزيد
        </Link>
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

    </section>
  );
}
