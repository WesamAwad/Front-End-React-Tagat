import { useState } from "react";
import { Heart, MapPin, Wrench } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAddFavoriteShopMutation, useRemoveFavoriteShopMutation } from "../../auth/authApi";
import { useAppSelector } from "../../../store/hooks";
import type { AuthValidationErrorResponse } from "../../../types/authTypes";
import type { PublicShop } from "../../../types/authTypes";
import { formatPublicShopLocation, formatPublicShopStatus } from "../formatPublicShopLocation";
import { StarRating } from "./StarRating";

type WorkshopCardProps = {
  shop: PublicShop;
  isFavorite?: boolean;
};

export function WorkshopCard({ shop, isFavorite: isFavoriteInitially = false }: WorkshopCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAppSelector((state) => state.auth.token);
  const [addFavoriteShop, { isLoading: isAddingFavorite }] = useAddFavoriteShopMutation();
  const [removeFavoriteShop, { isLoading: isRemovingFavorite }] = useRemoveFavoriteShopMutation();
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null);
  const isFavorite = favoriteOverride ?? isFavoriteInitially;
  const isTogglingFavorite = isAddingFavorite || isRemovingFavorite;
  const [favoriteError, setFavoriteError] = useState("");

  const shopLocation = formatPublicShopLocation(shop);
  const statusLabel = formatPublicShopStatus(shop.status);

  const handleFavoriteClick = async () => {
    setFavoriteError("");

    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (isTogglingFavorite) return;

    try {
      if (isFavorite) {
        await removeFavoriteShop(shop.id).unwrap();
        setFavoriteOverride(false);
      } else {
        await addFavoriteShop(shop.id).unwrap();
        setFavoriteOverride(true);
      }
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setFavoriteError(
        errorData?.message || (isFavorite ? "تعذر إزالة الورشة من المفضلة." : "تعذر إضافة الورشة إلى المفضلة."),
      );
    }
  };

  return (
    <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md">
      <div className="relative h-40 overflow-hidden bg-primary-light/40">
        {shop.cover_image ? (
          <img
            src={shop.cover_image}
            alt={shop.shop_name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary/30">
            <Wrench className="size-10" aria-hidden="true" />
          </div>
        )}
        <button
          type="button"
          aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          aria-pressed={isFavorite}
          disabled={isTogglingFavorite}
          onClick={handleFavoriteClick}
          className={`absolute inset-e-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
            isFavorite ? "text-secondary" : "text-gray-500 hover:text-secondary"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
        {favoriteError ? (
          <p className="absolute inset-x-3 bottom-3 rounded-md bg-red-50 px-2 py-1 text-[10px] text-red-700" role="alert">
            {favoriteError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-medium text-gray-900">{shop.shop_name}</h3>
            <div className="mt-1.5" aria-hidden="true">
              <StarRating rating={5} starClassName="h-3.5 w-3.5" />
            </div>
          </div>
          {shop.status ? (
            <span className="shrink-0 rounded-md bg-primary-light px-2 py-1 text-[10px] font-medium text-primary">{statusLabel}</span>
          ) : null}
        </div>

        {shopLocation ? (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary" />
            <p className="text-sm text-gray-600">{shopLocation}</p>
          </div>
        ) : null}

        {shop.services.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {shop.services.map((service) => (
              <span key={service} className="rounded-md bg-secondary/10 px-2 py-1 text-[10px] text-gray-800">
                {service}
              </span>
            ))}
          </div>
        ) : null}

        <hr className="border-gray-100" />

        <div className="flex gap-2">
          <Link
            to="/workshops/booking"
            className="flex flex-1 items-center justify-center rounded-md bg-primary py-2 text-sm font-bold text-white transition hover:bg-primary-hover"
          >
            احجز موعد
          </Link>
          <Link
            to={`/workshops/${shop.id}`}
            className="flex flex-1 items-center justify-center rounded-md border border-primary py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
          >
            عرض التفاصيل
          </Link>
        </div>
      </div>
    </article>
  );
}
