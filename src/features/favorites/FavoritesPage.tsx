import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetAllPublicShopsQuery, useGetMyFavoritesQuery } from "../auth/authApi";
import { useAppSelector } from "../../store/hooks";
import { mapFavoriteToPublicShop } from "./favoriteUtils";
import { WorkshopCard } from "../workshops/components/WorkshopCard";

function FavoritesPage() {
  const token = useAppSelector((state) => state.auth.token);
  const { data, isLoading, isError } = useGetMyFavoritesQuery(undefined, {
    skip: !token,
  });
  const { data: publicShopsData } = useGetAllPublicShopsQuery();
  const publicShops = publicShopsData?.data ?? [];

  const favorites = data?.favorites ?? [];

  if (!token) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-light text-secondary">
          <Heart className="size-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-primary">المفضلة</h1>
        <p className="mt-3 text-sm text-gray-600">سجّل الدخول لعرض ورشك المفضلة.</p>
        <Link to="/login" state={{ from: "/favorites" }} className="mt-8 inline-flex rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-primary/70" role="status">
          جاري تحميل المفضلة...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8" role="alert">
        <p className="text-sm font-medium text-red-700">تعذر تحميل المفضلة</p>
        <p className="mt-1 text-xs text-red-600">حاول تحديث الصفحة أو المحاولة لاحقاً.</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-light text-secondary">
          <Heart className="size-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-primary">المفضلة</h1>
        <p className="mt-3 text-sm text-gray-600">لا توجد ورش مفضلة بعد. تصفّح الورشات وأضف ما يعجبك إلى قائمتك.</p>
        <Link to="/workshops" className="mt-8 inline-flex rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover">
          تصفح الورشات
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">المفضلة</h1>
        <p className="mt-1 text-sm text-gray-600">{favorites.length} ورشة محفوظة</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {favorites.map((favorite) => (
          <WorkshopCard
            key={favorite.id}
            shop={mapFavoriteToPublicShop(favorite, publicShops)}
            isFavorite
          />
        ))}
      </div>
    </div>
  );
}

export default FavoritesPage;
