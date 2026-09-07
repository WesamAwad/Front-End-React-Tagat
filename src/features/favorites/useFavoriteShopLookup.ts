import { useMemo } from "react";
import { useGetAllPublicShopsQuery, useGetMyFavoritesQuery } from "../auth/authApi";
import { useAppSelector } from "../../store/hooks";
import type { PublicShop } from "../../types/authTypes";
import { buildFavoriteShopLookup } from "./favoriteUtils";

const EMPTY_PUBLIC_SHOPS: PublicShop[] = [];

export function useFavoriteShopLookup() {
  const token = useAppSelector((state) => state.auth.token);
  const { data, isLoading, isFetching, isError } = useGetMyFavoritesQuery(undefined, {
    skip: !token,
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
    isLoading: Boolean(token) && isLoading,
    isFetching: Boolean(token) && isFetching,
    isError: Boolean(token) && isError,
    isLoggedIn: Boolean(token),
  };
}
