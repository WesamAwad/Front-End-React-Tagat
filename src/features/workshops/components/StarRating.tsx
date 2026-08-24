import { Star } from "lucide-react";

type StarRatingProps = {
  rating: number;
};

export function StarRating({ rating }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= Math.round(rating) ? "fill-secondary text-secondary" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}
