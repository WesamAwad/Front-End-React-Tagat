import { mockWorkshops } from "../data/workshops.mock";
import type { WorkshopDetails } from "./types";

const baseWorkshop = mockWorkshops[0];

export const mockWorkshopDetails: WorkshopDetails = {
  ...baseWorkshop,
  name: "ورشة التقنية المتقدمة",
  rating: 4.5,
  reviewCount: 312,
  location: "الرياض — حي العليا",
  isOpen: true,
  closesAt: "7:00 م",
  distance: "1.2 كم منك",
  completedRepairs: 1840,
  responseTime: "< 30 دقيقة",
  minPrice: 80,
  deviceTypesCount: 3,
  whyChooseTitle: "لماذا ورشة التقنية المتقدمة؟",
  whyChooseItems: [
    "الدفع بعد الموافقة فقط",
    "ضمان على جميع الإصلاحات",
    "فنيون معتمدون وموثوقون",
    "تتبع حالة الإصلاح لحظياً",
  ],
  services: [
    { id: "1", name: "استبدال شاشة", priceMin: 180, priceMax: 450, includesParts: true },
    { id: "2", name: "تغيير بطارية", priceMin: 180, priceMax: 450, includesParts: true },
    { id: "3", name: "إصلاح لوحة أم", priceMin: 180, priceMax: 450, includesParts: true },
    { id: "4", name: "تنظيف وصيانة", priceMin: 180, priceMax: 450, includesParts: true },
  ],
  spareParts: [
    { id: "1", name: "شاشة آيفون", subtitle: "قطعة أصلية · ضمان 6 أشهر", price: 220, quantity: 5, image: "", isAvailable: true },
    { id: "2", name: "بطارية سامسونج", subtitle: "قطعة أصلية · ضمان 6 أشهر", price: 180, quantity: 8, image: "", isAvailable: true },
    { id: "3", name: "شاشة آيباد", subtitle: "قطعة أصلية · ضمان 6 أشهر", price: 350, quantity: 3, image: "", isAvailable: true },
    { id: "4", name: "كاميرا خلفية", subtitle: "قطعة أصلية · ضمان 6 أشهر", price: 150, quantity: 12, image: "", isAvailable: true },
  ],
  reviewSummary: {
    overallRating: 4.8,
    categoryScores: [
      { label: "الجودة", score: 4.9 },
      { label: "الالتزام", score: 4.7 },
      { label: "السعر", score: 4.6 },
      { label: "التواصل", score: 4.8 },
    ],
    distribution: [
      { stars: 5, percentage: 74 },
      { stars: 4, percentage: 16 },
      { stars: 3, percentage: 6 },
      { stars: 2, percentage: 3 },
      { stars: 1, percentage: 1 },
    ],
  },
  reviews: [
    {
      id: "1",
      authorName: "أحمد المنصور",
      rating: 5,
      date: "5 أغسطس 2025",
      serviceType: "استبدال شاشة",
      device: "آيفون 15 برو",
      text: "خدمة احترافية من الدرجة الأولى. استبدلوا الشاشة في أقل من ساعة والجهاز كأنه جديد.",
    },
    {
      id: "2",
      authorName: "سارة الحربي",
      rating: 5,
      date: "28 يوليو 2025",
      serviceType: "تغيير بطارية",
      device: "سامسونج S24",
      text: "تجربة ممتازة من البداية للنهاية. السعر كان معقولاً والضمان مريح.",
    },
    {
      id: "3",
      authorName: "خالد العتيبي",
      rating: 4,
      date: "15 يوليو 2025",
      serviceType: "تنظيف وصيانة",
      device: "آيباد برو",
      text: "ورشة منظمة وسريعة. تم حل مشكلة البطارية بشكل نهائي.",
    },
    {
      id: "4",
      authorName: "نورة القحطاني",
      rating: 5,
      date: "3 يوليو 2025",
      serviceType: "إصلاح لوحة أم",
      device: "هواوي P60",
      text: "فريق محترف وتواصل ممتاز. أنصح بهذه الورشة بشدة.",
    },
  ],
};

export function getWorkshopDetailsById(id: string): WorkshopDetails | undefined {
  const workshop = mockWorkshops.find((item) => String(item.id) === id);
  if (!workshop) return undefined;

  return {
    ...mockWorkshopDetails,
    ...workshop,
    id: workshop.id,
    image: workshop.image,
  };
}
