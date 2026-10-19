import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardList, Star, Wrench } from "lucide-react";
import { useGetAllRepairRequestsQuery, useGetShopOwnerReviewsQuery } from "../../auth/authApi";
import { useWorkshopOwnerSession } from "../hooks/useWorkshopOwnerSession";

const IN_PROGRESS_STATUSES = new Set(["accepted", "approved", "confirmed"]);

function requestStatus(status: string) {
  return status.trim().toLowerCase();
}

function formatRating(average: number) {
  return average.toLocaleString("ar", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}

function HomeWorkshopPage() {
  const { displayName, profilePath } = useWorkshopOwnerSession();
  const { data: requestsData, isLoading: isRequestsLoading, isError: isRequestsError } = useGetAllRepairRequestsQuery();
  const { data: reviewsData, isLoading: isReviewsLoading, isError: isReviewsError } = useGetShopOwnerReviewsQuery();

  const requests = requestsData?.data ?? [];
  const newRequests = requests.filter((request) => requestStatus(request.status) === "pending").length;
  const inProgressRequests = requests.filter((request) => IN_PROGRESS_STATUSES.has(requestStatus(request.status))).length;
  const completedRequests = requests.filter((request) => requestStatus(request.status) === "completed").length;
  const reviewsCount = reviewsData?.reviews_count ?? 0;
  const hasRating = !isReviewsError && reviewsCount > 0;
  const firstName = displayName.split(/\s+/)[0] || displayName;

  const cards = [
    {
      title: "طلبات جديدة",
      value: isRequestsLoading ? "..." : isRequestsError ? "—" : String(newRequests),
      hint: isRequestsLoading ? "جاري التحميل..." : isRequestsError ? "تعذر تحميل الطلبات" : "بانتظار المراجعة",
      icon: ClipboardList,
      tone: "amber",
      to: "/workshop-owner/orders",
      cta: "عرض الطلبات",
    },
    {
      title: "طلبات قيد التنفيذ",
      value: isRequestsLoading ? "..." : isRequestsError ? "—" : String(inProgressRequests),
      hint: isRequestsLoading ? "جاري التحميل..." : isRequestsError ? "تعذر تحميل الطلبات" : "مقبولة وقيد العمل",
      icon: Wrench,
      tone: "navy",
      to: "/workshop-owner/orders",
      cta: "متابعة العمل",
    },
    {
      title: "طلبات مكتملة",
      value: isRequestsLoading ? "..." : isRequestsError ? "—" : String(completedRequests),
      hint: isRequestsLoading ? "جاري التحميل..." : isRequestsError ? "تعذر تحميل الطلبات" : "تم إنجازها بنجاح",
      icon: CheckCircle2,
      tone: "emerald",
      to: "/workshop-owner/orders",
      cta: "عرض المكتملة",
    },
    {
      title: "تقييم الورشة",
      value: isReviewsLoading ? "..." : hasRating ? formatRating(reviewsData?.average_rating ?? 0) : "—",
      hint: isReviewsLoading ? "جاري التحميل..." : isReviewsError ? "تعذر تحميل التقييم" : hasRating ? `من ${reviewsCount} تقييم` : "لا توجد تقييمات بعد",
      icon: Star,
      tone: "orange",
      to: "/workshop-owner/reviews",
      cta: "عرض التقييمات",
    },
  ] as const;

  const toneStyles = {
    amber: {
      iconWrap: "bg-amber-50 text-amber-700 ring-amber-200/80",
      accent: "from-amber-500/20 via-amber-400/5 to-transparent",
      bar: "bg-amber-500",
    },
    navy: {
      iconWrap: "bg-primary/10 text-primary ring-primary/15",
      accent: "from-primary/15 via-primary/5 to-transparent",
      bar: "bg-primary",
    },
    emerald: {
      iconWrap: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
      accent: "from-emerald-500/20 via-emerald-400/5 to-transparent",
      bar: "bg-emerald-500",
    },
    orange: {
      iconWrap: "bg-secondary/10 text-secondary ring-secondary/20",
      accent: "from-secondary/20 via-secondary/5 to-transparent",
      bar: "bg-secondary",
    },
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-primary px-6 py-8 text-white shadow-lg shadow-primary/20 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,140,66,0.28),transparent_55%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -inset-s-16 -top-20 size-56 rounded-full bg-secondary/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -inset-e-10 size-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-l from-transparent via-white/30 to-transparent" aria-hidden="true" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-white/65 sm:text-sm">لوحة صاحب الورشة</p>
            <h1 className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">مرحباً، {firstName}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">تابع طلبات العملاء وتقييم الورشة من مكان واحد، وابقَ على اطلاع بما يحتاج إجراءً اليوم.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/workshop-owner/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-secondary/30 transition hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              طلبات الإصلاح
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to={profilePath}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              صفحة الورشة
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="ملخص الورشة">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-primary">نظرة عامة</h2>
            <p className="mt-1 text-sm text-gray-500">أرقام مباشرة من طلباتك وتقييماتك</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            const tone = toneStyles[card.tone];

            return (
              <article
                key={card.title}
                className="group relative overflow-hidden rounded-2xl border border-primary/8 bg-white p-5 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-[0_18px_50px_-28px_rgba(15,23,42,0.55)] motion-reduce:transform-none motion-reduce:transition-none"
              >
                <div className={`pointer-events-none absolute inset-0 bg-linear-to-bl ${tone.accent}`} aria-hidden="true" />
                <div className={`absolute inset-y-5 inset-s-0 w-1 rounded-full ${tone.bar}`} aria-hidden="true" />

                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl" aria-live="polite">
                      {card.value}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">{card.hint}</p>
                  </div>
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ${tone.iconWrap}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                </div>

                <Link
                  to={card.to}
                  className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary/70 transition group-hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
                >
                  {card.cta}
                  <ArrowLeft className="size-3.5 transition group-hover:-translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default HomeWorkshopPage;
