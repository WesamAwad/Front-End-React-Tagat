import workshop1Img from "../../../assets/workshops/workshop-1.webp";
import workshop2Img from "../../../assets/workshops/workshop-2.webp";
import workshop3Img from "../../../assets/workshops/workshop-3.webp";
import type { Workshop } from "../types";

const images = [workshop1Img, workshop2Img, workshop3Img];

export const mockWorkshops: Workshop[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  name: "مستشار الأجهزة للإلكترونيات",
  rating: 4.5,
  reviewCount: 89,
  location: "حي العليا، الرياض",
  priceRange: "متوسط السعر 100 - 300 ر.س",
  tags: ["ضمان 6 أشهر", "اندرويد", "تابلت"],
  image: images[index % images.length],
}));
