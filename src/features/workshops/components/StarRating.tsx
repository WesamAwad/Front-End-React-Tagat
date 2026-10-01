import { Star } from "lucide-react";

type StarRatingProps = {
  rating: number;
  starClassName?: string;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  label?: string;
};

export function StarRating({ rating, starClassName = "h-4 w-4", interactive = false, onChange, label = "التقييم" }: StarRatingProps) {
  if (!interactive) {
    return (
      <div className="flex items-center gap-1" aria-label={`${label}: ${rating} من 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starClassName} ${star <= Math.round(rating) ? "fill-secondary text-secondary" : "fill-gray-200 text-gray-200"}`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => {
        const selected = star <= rating;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} من 5`}
            onClick={() => onChange?.(star)}
            className="rounded p-0.5 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <Star className={`${starClassName} ${selected ? "fill-secondary text-secondary" : "fill-gray-200 text-gray-200"}`} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
