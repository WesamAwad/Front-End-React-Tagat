import { useMemo } from "react";
import { useGetAllPublicShopsQuery, useGetMyFavoritesQuery } from "../auth/authApi";
import { useAppSelector } from "../../store/hooks";
import { isCustomerSession } from "../auth/authRoles";
import type { PublicShop } from "../../types/authTypes";
import { buildFavoriteShopLookup } from "./favoriteUtils";

const EMPTY_PUBLIC_SHOPS: PublicShop[] = [];

export function useFavoriteShopLookup() {
  const token = useAppSelector((state) => state.auth.token);
  const role = useAppSelector((state) => state.auth.user?.role);
  const canUseFavorites = Boolean(token) && isCustomerSession(role);
  const { data, isLoading, isFetching, isError } = useGetMyFavoritesQuery(undefined, {
    skip: !canUseFavorites,
  });
  const { data: publicShopsData } = useGetAllPublicShopsQuery();
  const publicShops = publicShopsData?.data ?? EMPTY_PUBLIC_SHOPS;

  const lookup = useMemo(
    () => buildFavoriteShopLookup(data?.favorites ?? [], publicShops),
    [data?.favorites, publicShops],
  );

  return {
    lookup,
    favorites: data?.favorites ?? [],
    count: data?.favorites?.length ?? 0,
    isLoading: canUseFavorites && isLoading,
    isFetching: canUseFavorites && isFetching,
    isError: canUseFavorites && isError,
    isLoggedIn: canUseFavorites,
  };
}
