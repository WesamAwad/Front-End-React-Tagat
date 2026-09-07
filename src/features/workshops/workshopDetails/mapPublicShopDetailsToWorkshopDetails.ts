import type { PublicShopDetails } from "../../../types/authTypes";
import { formatPublicShopLocation } from "../formatPublicShopLocation";
import type { WorkshopDetails } from "./types";

const EMPTY_REVIEW_SUMMARY: WorkshopDetails["reviewSummary"] = {
  overallRating: 0,
  categoryScores: [],
  distribution: [],
};

export function mapPublicShopDetailsToWorkshopDetails(shop: PublicShopDetails): WorkshopDetails {
  const location = formatPublicShopLocation(shop) || "—";
  const isOpen = shop.status.trim().toLowerCase() === "open";
  const serviceNames = shop.services.map((service) => service.name);
  const pricedServices = shop.services.filter((service) => service.priceMin > 0 || service.priceMax > 0);
  const minPrice = pricedServices.length > 0 ? Math.min(...pricedServices.map((service) => service.priceMin || service.priceMax)) : 0;

  return {
    id: shop.id,
    name: shop.shop_name || "ورشة بدون اسم",
    rating: 0,
    reviewCount: 0,
    location,
    priceRange: minPrice > 0 ? `${minPrice}+ ر.س` : "—",
    tags: serviceNames,
    image: shop.cover_image || "",
    isOpen,
    closesAt: "—",
    distance: "—",
    completedRepairs: 0,
    responseTime: "—",
    minPrice,
    deviceTypesCount: shop.services.length,
    whyChooseTitle: "لماذا تختار هذه الورشة؟",
    whyChooseItems:
      serviceNames.length > 0
        ? serviceNames.slice(0, 4)
        : shop.description
          ? [shop.description]
          : ["خدمات صيانة موثوقة", "فريق متخصص", "أسعار واضحة بعد الفحص"],
    services: shop.services.map((service) => ({
      id: service.id,
      name: service.name,
      priceMin: service.priceMin,
      priceMax: service.priceMax,
      includesParts: false,
    })),
    spareParts: shop.products.map((product) => ({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      price: product.price,
      quantity: product.quantity,
      image: product.image,
      isAvailable: product.isAvailable,
    })),
    reviewSummary: EMPTY_REVIEW_SUMMARY,
    reviews: [],
  };
}
