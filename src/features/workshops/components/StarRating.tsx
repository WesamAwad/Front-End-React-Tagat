import { Star } from "lucide-react";

type StarRatingProps = {
  rating: number;
  starClassName?: string;
};

export function StarRating({ rating, starClassName = "h-4 w-4" }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starClassName} ${star <= Math.round(rating) ? "fill-secondary text-secondary" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}
