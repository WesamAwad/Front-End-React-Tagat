import type { Workshop } from "../types";

export type WorkshopService = {
  id: string;
  name: string;
  priceMin: number;
  priceMax: number;
  includesParts: boolean;
};

export type WorkshopSparePart = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
  image: string;
  isAvailable: boolean;
};

export type WorkshopWorkingHourRow = {
  day: string;
  from: string;
  to: string;
};

export type WorkshopReviewCategoryScore = {
  label: string;
  score: number;
};

export type WorkshopReviewDistribution = {
  stars: 1 | 2 | 3 | 4 | 5;
  percentage: number;
};

export type WorkshopReviewSummary = {
  overallRating: number;
  categoryScores: WorkshopReviewCategoryScore[];
  distribution: WorkshopReviewDistribution[];
};

export type WorkshopReview = {
  id: string;
  userId?: string;
  authorName: string;
  rating: number;
  date: string;
  text: string;
  shopReply?: string | null;
  repliedAt?: string | null;
  serviceType?: string;
  device?: string;
};

export type WorkshopDetailsTab = "services" | "spare-parts" | "location" | "reviews";

export type WorkshopDetails = Workshop & {
  isOpen: boolean;
  closesAt: string;
  distance: string;
  completedRepairs: number;
  responseTime: string;
  minPrice: number;
  deviceTypesCount: number;
  whyChooseTitle: string;
  whyChooseItems: string[];
  services: WorkshopService[];
  spareParts: WorkshopSparePart[];
  reviewSummary: WorkshopReviewSummary;
  reviews: WorkshopReview[];
  latitude: string;
  longitude: string;
  detailedAddress: string;
  addressNote: string;
  workingHours: WorkshopWorkingHourRow[];
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
};
