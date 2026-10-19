import { useEffect, useId, useState } from "react";
import { Eye, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import SuccessToast from "../../../components/SuccessToast";
import type { AdminShopReview, AuthValidationErrorResponse } from "../../../types/authTypes";
import { useDeleteAdminReviewMutation, useGetAdminReviewsQuery } from "../../auth/authApi";
import { StarRating } from "../../workshops/components/StarRating";

function formatReviewDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function useDialogLock(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);
}

function ReviewDetailsDialog({
  review,
  shopName,
  open,
  onClose,
  onDelete,
}: {
  review: AdminShopReview | null;
  shopName: string;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const titleId = useId();
  useDialogLock(open, onClose);

  if (!open || !review) return null;

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center p-4" role="presentation">
      <button type="button" aria-label="إغلاق تفاصيل التقييم" className="absolute inset-0 bg-primary/45 backdrop-blur-[2px]" onClick={onClose} />

      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-[#0a0a0a]">
              تفاصيل التعليق
            </h2>
            <p className="mt-1 text-sm text-[#777]">{shopName}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#777] transition hover:bg-[#f3f3f3] hover:text-primary" aria-label="إغلاق">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[#f0f0f0] overflow-hidden rounded-lg border border-[#f0f0f0]">
          <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
            <dt className="shrink-0 text-sm font-medium text-[#666]">العميل</dt>
            <dd className="text-sm text-primary sm:max-w-[65%] sm:text-start">{review.user.name}</dd>
          </div>
          <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
            <dt className="shrink-0 text-sm font-medium text-[#666]">التقييم</dt>
            <dd className="sm:max-w-[65%]">
              <StarRating rating={review.rating} starClassName="size-4" />
            </dd>
          </div>
          <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
            <dt className="shrink-0 text-sm font-medium text-[#666]">التعليق</dt>
            <dd className="text-sm leading-relaxed text-primary sm:max-w-[65%] sm:text-start">{review.comment || "بدون تعليق"}</dd>
          </div>
          <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
            <dt className="shrink-0 text-sm font-medium text-[#666]">رد الورشة</dt>
            <dd className="text-sm leading-relaxed text-primary sm:max-w-[65%] sm:text-start">{review.shop_reply || "لا يوجد رد"}</dd>
          </div>
          <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
            <dt className="shrink-0 text-sm font-medium text-[#666]">التاريخ</dt>
            <dd className="text-sm text-primary sm:max-w-[65%] sm:text-start">{formatReviewDate(review.created_at)}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-primary/15 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
            إغلاق
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            حذف التعليق
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminReviewsPage() {
  const { data, isLoading, isError, error, isFetching } = useGetAdminReviewsQuery();
  const [deleteAdminReview, { isLoading: isDeleting }] = useDeleteAdminReviewMutation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const reviews = data?.reviews ?? [];
  const selectedReview = reviews.find((item) => item.id === selectedId) ?? null;
  const deleteTarget = reviews.find((item) => item.id === deleteId) ?? null;

  const requestDelete = (id: string) => {
    setDeleteError("");
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteError("");
    try {
      await deleteAdminReview({ id: deleteId, shopId: deleteTarget?.shop_id || undefined }).unwrap();
      if (selectedId === deleteId) setSelectedId(null);
      setDeleteId(null);
      setSuccessOpen(true);
    } catch (err) {
      const errorData = (err as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "تعذر حذف التقييم.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-primary">إدارة التقييمات</h1>
            <p className="mt-1 text-sm text-gray-600">عرض تعليقات العملاء وحذف أي تعليق غير مناسب.</p>
          </div>
          <div className="rounded-lg border border-primary/10 bg-primary-light/50 px-4 py-2 text-center">
            <p className="text-xs text-gray-500">إجمالي التعليقات</p>
            <p className="text-lg font-bold text-primary">{reviews.length}</p>
          </div>
        </div>
      </section>

      {isLoading || isFetching ? (
        <p className="text-sm text-gray-500" role="status">
          جاري تحميل التعليقات...
        </p>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {(error as { data?: AuthValidationErrorResponse })?.data?.message || "تعذر تحميل التقييمات."}
        </div>
      ) : null}

      {!isLoading && !isFetching && !isError && reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">لا توجد تعليقات</p>
        </div>
      ) : null}

      {!isLoading && reviews.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-primary-light/60 text-start text-xs font-semibold uppercase tracking-wide text-primary">
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الورشة
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    العميل
                  </th>
                  <th scope="col" className="min-w-56 px-4 py-3.5 sm:px-6">
                    التعليق
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    التاريخ
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {reviews.map((item) => (
                  <tr key={item.id} className="transition hover:bg-primary-light/30">
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-800 sm:px-6">{item.shop_name || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-800 sm:px-6">{item.user.name}</td>
                    <td className="max-w-md px-4 py-4 text-gray-600 sm:px-6">
                      <p className="line-clamp-2 whitespace-normal">{item.comment || "بدون تعليق"}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6">{formatReviewDate(item.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      <div className="inline-flex items-center overflow-hidden rounded-lg border border-primary/10 bg-white shadow-sm" role="group" aria-label={`إجراءات التعليق ${item.id}`}>
                        <button
                          type="button"
                          title="عرض التعليق"
                          aria-label={`عرض تعليق ${item.user.name}`}
                          onClick={() => setSelectedId(item.id)}
                          className="inline-flex size-8 items-center justify-center text-primary transition hover:bg-primary-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
                        >
                          <Eye className="size-3.5" aria-hidden="true" />
                        </button>
                        <span className="h-4 w-px bg-primary/10" aria-hidden="true" />
                        <button
                          type="button"
                          title="حذف"
                          aria-label={`حذف تعليق ${item.user.name}`}
                          onClick={() => requestDelete(item.id)}
                          className="inline-flex size-8 items-center justify-center text-gray-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <ReviewDetailsDialog
        review={selectedReview}
        shopName={selectedReview?.shop_name || "—"}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        onDelete={() => {
          if (selectedId) requestDelete(selectedId);
        }}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="حذف التعليق"
        message="هل أنت متأكد من حذف هذا التعليق نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        variant="danger"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteId(null);
            setDeleteError("");
          }
        }}
      />

      <SuccessToast open={successOpen} title="تم الحذف" message="تم حذف التعليق بنجاح." onClose={() => setSuccessOpen(false)} />
    </div>
  );
}

export default AdminReviewsPage;
