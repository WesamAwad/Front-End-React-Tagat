import { useGetPlatformStatisticsQuery } from "../auth/authApi";
import { StarRating } from "../workshops/components/StarRating";

const EMPTY_REVIEWS: never[] = [];
const MAX_HOME_REVIEWS = 6;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 1);
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`;
}

export function TestimonialsSection() {
  const { data, isLoading, isError } = useGetPlatformStatisticsQuery();
  const reviews = (data?.reviews ?? EMPTY_REVIEWS).slice(0, MAX_HOME_REVIEWS);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <p className="text-sm text-gray-400">آراء العملاء</p>
        <h2 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">ماذا يقول عملاؤنا؟</h2>
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-primary/70" role="status">
          جاري تحميل آراء العملاء...
        </p>
      ) : isError ? (
        <p className="text-center text-sm text-red-600" role="alert">
          تعذر تحميل آراء العملاء.
        </p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-sm text-gray-500">لا توجد آراء بعد.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <article key={`${review.customer_name}-${index}`} className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-6 transition hover:border-secondary">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary" aria-hidden="true">
                  {getInitials(review.customer_name)}
                </span>
                <p className="text-base font-medium text-gray-800">{review.customer_name}</p>
              </div>

              <p className="text-sm leading-relaxed text-gray-500">&ldquo;{review.comment}&rdquo;</p>

              <StarRating rating={review.rating} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
