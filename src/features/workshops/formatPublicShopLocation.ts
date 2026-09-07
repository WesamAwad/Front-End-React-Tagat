import type { PublicShop } from "../../types/authTypes";

export function formatPublicShopLocation(shop: Pick<PublicShop, "district" | "street" | "city" | "country">) {
  return [shop.country, shop.city, shop.district, shop.street].filter(Boolean).join("، ");
}

export function formatPublicShopStatus(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "open") {
    return " مفتوح الآن";
  }

  if (normalized === "closed") {
    return "مغلق";
  }
  if (normalized === "blocked") {
    return "غير نشط";
  }

  return status || "—";
}
