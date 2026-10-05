import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import heroBg from "../../assets/booking/hero.png";
import { useGetMyRepairRequestsQuery } from "../auth/authApi";
import { isCustomerSession } from "../auth/authRoles";
import { useAppSelector } from "../../store/hooks";
import type { AuthValidationErrorResponse } from "../../types/authTypes";
import { BookingCard, type BookingCardData } from "./BookingCard";
import { bookingStatusMeta, formatBookingDate, mapRepairRequestStatus, type BookingStatus } from "./bookingStatus";

type StatusFilter = "all" | BookingStatus;

const filters: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "pending", label: bookingStatusMeta.pending.tabLabel },
  { id: "repairing", label: bookingStatusMeta.repairing.tabLabel },
  { id: "completed", label: bookingStatusMeta.completed.tabLabel },
  { id: "cancelled", label: bookingStatusMeta.cancelled.tabLabel },
];

function BookingsPage() {
  const token = useAppSelector((state) => state.auth.token);
  const role = useAppSelector((state) => state.auth.user?.role);
  const canLoadBookings = Boolean(token) && isCustomerSession(role);
  const { data, isLoading, error } = useGetMyRepairRequestsQuery(undefined, { skip: !canLoadBookings });
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "حجوزاتي | SwiftFix";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const loadError =
    error && typeof error === "object" && "data" in error ? ((error.data as AuthValidationErrorResponse | undefined)?.message ?? "").trim() : "";

  const bookings: BookingCardData[] = (data?.data ?? []).map((request) => ({
    id: request.id,
    workshopName: request.shop_name,
    device: request.device_model_name,
    service: request.service_name,
    appointment: formatBookingDate(request.created_at),
    status: mapRepairRequestStatus(request.status),
    statusLabel: request.status,
  }));

  const normalizedQuery = query.trim().toLowerCase();
  const visibleBookings = bookings.filter((booking) => {
    const matchesStatus = status === "all" || booking.status === status;
    if (!matchesStatus) return false;
    if (!normalizedQuery) return true;

    const haystack = [booking.workshopName, booking.device, booking.service, booking.statusLabel].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  return (
    <div className="pb-16">
      <nav aria-label="مسار الصفحة" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <ol className="flex items-center gap-2 text-xs text-[#888]">
          <li>
            <Link to="/" className="transition hover:text-primary">
              الرئيسية
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>حسابي</li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-primary" aria-current="page">
            حجوزاتي
          </li>
        </ol>
      </nav>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative h-51.25 overflow-hidden rounded-xl">
          <img src={heroBg} alt="" className="absolute top-[-96.81%] left-0 h-[204.47%] w-full max-w-none" />
          <div className="absolute inset-0 bg-[rgba(22,42,79,0.55)]" />
          <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
            <h1 className="text-3xl font-bold leading-normal sm:text-4xl">حجوزاتي</h1>
            <p className="mt-3 text-base">تتبع جميع طلبات الإصلاح والمواعيد الخاصة بك</p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="حجوزات الإصلاح">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {filters.map((filter) => {
              const isActive = status === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setStatus(filter.id)}
                  className={
                    isActive
                      ? "rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      : "rounded-lg px-1 py-2 text-sm font-medium text-[#777] transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  }
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <label className="flex h-14 w-full items-center gap-2 rounded-xl border border-[#ececec] bg-white px-4 lg:max-w-xl">
            <Search className="size-5 shrink-0 text-[#9a9a9a]" aria-hidden="true" />
            <span className="sr-only">ابحث عن حجز معين</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن حجز معين" className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-[#9a9a9a]" />
          </label>
        </div>

        {!canLoadBookings ? (
          <div className="mt-10 rounded-2xl border border-primary/10 bg-white px-6 py-10 text-center">
            <p className="text-sm text-primary/70">سجّل الدخول لعرض حجوزاتك.</p>
            <Link to="/login" state={{ from: "/bookings" }} className="mt-6 inline-flex rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover">
              تسجيل الدخول
            </Link>
          </div>
        ) : isLoading ? (
          <p className="mt-10 rounded-2xl border border-primary/10 bg-white px-6 py-10 text-center text-sm text-primary/70" role="status">
            جاري تحميل الحجوزات...
          </p>
        ) : loadError ? (
          <p className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700" role="alert">
            {loadError}
          </p>
        ) : visibleBookings.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-primary/10 bg-white px-6 py-10 text-center text-sm text-primary/70" role="status">
            لا توجد حجوزات مطابقة.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {visibleBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default BookingsPage;
