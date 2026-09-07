import type { FavoriteShop, PublicShop } from "../../types/authTypes";

export function resolveFavoriteShopId(favorite: FavoriteShop, publicShops: PublicShop[] = []): string {
  if (favorite.shop_id) return favorite.shop_id;

  const byName = publicShops.find((shop) => shop.shop_name.trim() === favorite.shop_name.trim());
  if (byName) return byName.id;

  return favorite.id;
}

export function mapFavoriteToPublicShop(favorite: FavoriteShop, publicShops: PublicShop[] = []): PublicShop {
  return {
    id: resolveFavoriteShopId(favorite, publicShops),
    shop_name: favorite.shop_name,
    cover_image: favorite.cover_image,
    country: favorite.country,
    city: favorite.city,
    district: favorite.district,
    street: favorite.street,
    status: "",
    services: favorite.services.map((service) => service.service_name),
  };
}

export function buildFavoriteShopLookup(favorites: FavoriteShop[], publicShops: PublicShop[] = []) {
  const ids = new Set<string>();
  const names = new Set<string>();

  favorites.forEach((favorite) => {
    const shopId = resolveFavoriteShopId(favorite, publicShops);
    if (shopId) ids.add(shopId);
    if (favorite.shop_name) names.add(favorite.shop_name.trim());
  });

  return { ids, names };
}

export function isShopInFavorites(shop: PublicShop, lookup: { ids: Set<string>; names: Set<string> }) {
  if (lookup.ids.has(shop.id)) return true;
  return lookup.names.has(shop.shop_name.trim());
}
