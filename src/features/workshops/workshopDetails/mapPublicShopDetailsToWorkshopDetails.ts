import type { PublicShopDetails, ShopProfileWorkingHour } from "../../../types/authTypes";
import { formatPublicShopLocation } from "../formatPublicShopLocation";
import type { WorkshopDetails } from "./types";

const EMPTY_REVIEW_SUMMARY: WorkshopDetails["reviewSummary"] = {
  overallRating: 0,
  categoryScores: [],
  distribution: [],
};

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

function formatClock(value: string) {
  const raw = value.trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;

  let hour = Number(match[1]);
  const minute = match[2];
  if (!Number.isFinite(hour)) return raw;

  const period = hour >= 12 ? "م" : "ص";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${period}`;
}

function normalizeDayKey(day: string) {
  const value = day.trim().toLowerCase();
  if ((DAY_KEYS as readonly string[]).includes(value)) return value;

  const arabicMap: Record<string, (typeof DAY_KEYS)[number]> = {
    الأحد: "sunday",
    الاحد: "sunday",
    الاثنين: "monday",
    الإثنين: "monday",
    الثلاثاء: "tuesday",
    الأربعاء: "wednesday",
    الاربعاء: "wednesday",
    الخميس: "thursday",
    الجمعة: "friday",
    السبت: "saturday",
  };

  return arabicMap[day.trim()] ?? arabicMap[value] ?? value;
}

function deriveClosesAt(hours: ShopProfileWorkingHour[]) {
  const todayKey = DAY_KEYS[new Date().getDay()];
  const today = hours.find((item) => normalizeDayKey(item.day) === todayKey);
  if (!today?.to) return "—";
  return formatClock(today.to) || "—";
}

function buildDetailedAddress(shop: PublicShopDetails) {
  return [shop.street, shop.district, shop.city, shop.country].filter(Boolean).join("، ");
}

export function mapPublicShopDetailsToWorkshopDetails(shop: PublicShopDetails): WorkshopDetails {
  const location = formatPublicShopLocation(shop) || "—";
  const isOpen = shop.status.trim().toLowerCase() === "open";
  const serviceNames = shop.services.map((service) => service.name);
  const pricedServices = shop.services.filter((service) => service.priceMin > 0 || service.priceMax > 0);
  const minPrice = pricedServices.length > 0 ? Math.min(...pricedServices.map((service) => service.priceMin || service.priceMax)) : 0;
  const detailedAddress = buildDetailedAddress(shop) || location;

  const whyChooseItems = shop.features.map((item) => item.feature).filter(Boolean);

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
    closesAt: deriveClosesAt(shop.working_hours),
    distance: "—",
    completedRepairs: 0,
    responseTime: "—",
    minPrice,
    deviceTypesCount: shop.services.length,
    whyChooseTitle: "لماذا تختار هذه الورشة؟",
    whyChooseItems,
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
    latitude: shop.latitude,
    longitude: shop.longitude,
    detailedAddress,
    addressNote: "",
    workingHours: shop.working_hours.map((item) => ({
      day: normalizeDayKey(item.day),
      from: item.from,
      to: item.to,
    })),
    phone: shop.phone,
    whatsapp: shop.whatsapp,
    email: shop.email,
    website: shop.website,
  };
}
