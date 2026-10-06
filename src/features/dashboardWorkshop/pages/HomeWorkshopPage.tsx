import { useGetAllRepairRequestsQuery, useGetShopOwnerReviewsQuery } from "../../auth/authApi";

const IN_PROGRESS_STATUSES = new Set(["accepted", "approved", "confirmed"]);

function requestStatus(status: string) {
  return status.trim().toLowerCase();
}

function formatRating(average: number) {
  return average.toLocaleString("ar", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}

function HomeWorkshopPage() {
  const { data: requestsData, isLoading: isRequestsLoading, isError: isRequestsError } = useGetAllRepairRequestsQuery();
  const { data: reviewsData, isLoading: isReviewsLoading, isError: isReviewsError } = useGetShopOwnerReviewsQuery();

  const requests = requestsData?.data ?? [];
  const newRequests = requests.filter((request) => requestStatus(request.status) === "pending").length;
  const inProgressRequests = requests.filter((request) => IN_PROGRESS_STATUSES.has(requestStatus(request.status))).length;
  const reviewsCount = reviewsData?.reviews_count ?? 0;
  const hasRating = !isReviewsError && reviewsCount > 0;

  const cards = [
    {
      title: "طلبات جديدة",
      value: isRequestsLoading ? "..." : isRequestsError ? "—" : String(newRequests),
      hint: isRequestsLoading ? "جاري التحميل..." : isRequestsError ? "تعذر تحميل الطلبات" : "بانتظار المراجعة",
    },
    {
      title: "طلبات قيد التنفيذ",
      value: isRequestsLoading ? "..." : isRequestsError ? "—" : String(inProgressRequests),
      hint: isRequestsLoading ? "جاري التحميل..." : isRequestsError ? "تعذر تحميل الطلبات" : "مقبولة وقيد العمل",
    },
    {
      title: "تقييم الورشة",
      value: isReviewsLoading ? "..." : hasRating ? formatRating(reviewsData?.average_rating ?? 0) : "—",
      hint: isReviewsLoading ? "جاري التحميل..." : isReviewsError ? "تعذر تحميل التقييم" : hasRating ? `من ${reviewsCount} تقييم` : "لا توجد تقييمات بعد",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-primary">مرحباً بك في لوحة الورشة</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">من هنا تتابع الطلبات الجديدة، والطلبات قيد التنفيذ، وتقييم الورشة.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-xl border border-primary/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="mt-2 text-3xl font-bold text-primary" aria-live="polite">
              {card.value}
            </p>
            <p className="mt-2 text-xs text-gray-400">{card.hint}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default HomeWorkshopPage;
