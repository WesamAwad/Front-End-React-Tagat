import type { PublicShop } from "../../../types/authTypes";
import { formatPublicShopLocation } from "../formatPublicShopLocation";
import type { WorkshopDetails } from "./types";

const EMPTY_REVIEW_SUMMARY: WorkshopDetails["reviewSummary"] = {
  overallRating: 0,
  categoryScores: [],
  distribution: [],
};

export function mapPublicShopToWorkshopDetails(shop: PublicShop): WorkshopDetails {
  const location = formatPublicShopLocation(shop) || "—";
  const isOpen = shop.status.trim().toLowerCase() === "open";

  return {
    id: shop.id,
    name: shop.shop_name || "ورشة بدون اسم",
    rating: 0,
    reviewCount: 0,
    location,
    priceRange: "—",
    tags: shop.services,
    image: shop.cover_image || "",
    isOpen,
    closesAt: "—",
    distance: "—",
    completedRepairs: 0,
    responseTime: "—",
    minPrice: 0,
    deviceTypesCount: shop.services.length,
    whyChooseTitle: "لماذا تختار هذه الورشة؟",
    whyChooseItems: shop.services.length > 0 ? shop.services.slice(0, 4) : ["خدمات صيانة موثوقة", "فريق متخصص", "أسعار واضحة بعد الفحص"],
    services: shop.services.map((name, index) => ({
      id: `${shop.id}-service-${index}`,
      name,
      priceMin: 0,
      priceMax: 0,
      includesParts: false,
    })),
    spareParts: [],
    reviewSummary: EMPTY_REVIEW_SUMMARY,
    reviews: [],
  };
}
