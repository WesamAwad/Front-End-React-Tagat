import { Star } from "lucide-react";
import { StarRating } from "../components/StarRating";
import type { WorkshopDetails } from "./types";

type WorkshopReviewsTabProps = {
  workshop: WorkshopDetails;
};

export function WorkshopReviewsTab({ workshop }: WorkshopReviewsTabProps) {
  const { reviewSummary, reviews, reviewCount } = workshop;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#ebebeb] bg-[#fafafa] p-4 sm:p-5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center text-center lg:shrink-0">
            <p className="text-4xl font-bold text-[#222]">{reviewSummary.overallRating}</p>
            <StarRating rating={reviewSummary.overallRating} starClassName="size-3" />
            <p className="mt-1 text-xs text-[#888]">{reviewCount} تقييم</p>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            {reviewSummary.distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-xs text-[#666]">{item.stars}</span>
                <Star className="size-2.5 shrink-0 fill-secondary text-secondary" aria-hidden="true" />
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#ebebeb]">
                  <div className="me-auto h-full rounded-full bg-secondary" style={{ width: `${item.percentage}%` }} />
                </div>
                <span className="w-8 shrink-0 text-xs text-[#888]">{item.percentage}%</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 lg:shrink-0">
            {reviewSummary.categoryScores.map((category) => (
              <div key={category.label} className="flex items-center justify-between gap-6 text-sm">
                <span className="text-[#666]">{category.label}</span>
                <span className="font-medium text-[#222]">{category.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#ebebeb]">
        {reviews.map((review) => (
          <article key={review.id} className="py-4 first:pt-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                  aria-hidden="true"
                >
                  {review.authorName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#2a2a2a]">{review.authorName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StarRating rating={review.rating} starClassName="size-3" />
                    <span className="text-xs text-[#aaa]">{review.date}</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <span className="inline-block rounded-full bg-[#ffefe4] px-2.5 py-1 text-[11px] font-semibold text-secondary">
                  {review.serviceType}
                </span>
                <p className="mt-1 text-center text-xs text-[#aaa]">{review.device}</p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[#525252]">{review.text}</p>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="rounded-lg border border-[#ebebeb] bg-white px-4 py-2.5 text-sm font-medium text-primary transition hover:border-secondary hover:text-secondary"
      >
        عرض جميع التقييمات ({reviewCount})
      </button>
    </div>
  );
}
