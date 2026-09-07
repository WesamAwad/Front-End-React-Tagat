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
  authorName: string;
  rating: number;
  date: string;
  serviceType: string;
  device: string;
  text: string;
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
};
