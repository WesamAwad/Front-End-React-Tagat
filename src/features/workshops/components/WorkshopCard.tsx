import { Heart, MapPin, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import type { Workshop } from "../types";
import { StarRating } from "./StarRating";

type WorkshopCardProps = {
  workshop: Workshop;
};

export function WorkshopCard({ workshop }: WorkshopCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md">
      <div className="relative h-40 overflow-hidden">
        <img
          src={workshop.image}
          alt={workshop.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          aria-label="إضافة للمفضلة"
          className="absolute inset-e-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-500 shadow backdrop-blur-sm transition hover:text-secondary"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <h3 className="text-lg font-medium text-gray-900">{workshop.name}</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <StarRating rating={workshop.rating} />
            <span className="text-xs text-primary">({workshop.rating})</span>
          </div>
          <p className="text-xs text-gray-400">{workshop.reviewCount} تقييم</p>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary" />
          <p className="text-sm text-gray-600">{workshop.location}</p>
        </div>

        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 shrink-0 text-secondary" />
          <p className="text-sm text-gray-600">{workshop.priceRange}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {workshop.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-secondary/10 px-2 py-1 text-[10px] text-gray-800">
              {tag}
            </span>
          ))}
        </div>

        <hr className="border-gray-100" />

        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-md bg-primary py-2 text-sm font-bold text-white transition hover:bg-primary-hover"
          >
            احجز موعد
          </button>
          <Link
            to={`/workshops/${workshop.id}`}
            className="flex flex-1 items-center justify-center rounded-md border border-primary py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
          >
            عرض التفاصيل
          </Link>
        </div>
      </div>
    </article>
  );
}
