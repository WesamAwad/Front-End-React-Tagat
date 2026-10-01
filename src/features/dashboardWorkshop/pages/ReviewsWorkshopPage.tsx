import { useEffect, useId, useState, type FormEvent } from "react";
import { Eye, Reply, Star, X } from "lucide-react";
import SuccessToast from "../../../components/SuccessToast";
import type { AuthValidationErrorResponse, ShopReview } from "../../../types/authTypes";
import { useGetShopOwnerReviewsQuery, useReplyShopOwnerReviewMutation } from "../../auth/authApi";
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
  open,
  onClose,
}: {
  review: ShopReview | null;
  open: boolean;
  onClose: () => void;
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
              تفاصيل التقييم
            </h2>
            <p className="mt-1 text-sm text-[#777]">#{review.id}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#777] transition hover:bg-[#f3f3f3] hover:text-primary" aria-label="إغلاق">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{review.user.name.charAt(0) || "م"}</div>
            <div>
              <p className="text-sm font-medium text-primary">{review.user.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <StarRating rating={review.rating} starClassName="size-3.5" />
                <span className="text-xs text-[#999]">{formatReviewDate(review.created_at)}</span>
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[#444]">{review.comment || "—"}</p>
          {review.shop_reply ? (
            <div className="rounded-lg border border-primary/10 bg-primary-light/40 px-4 py-3">
              <p className="text-xs font-semibold text-primary">ردك</p>
              <p className="mt-1 text-sm text-[#444]">{review.shop_reply}</p>
              {review.replied_at ? <p className="mt-1 text-[11px] text-[#999]">{formatReviewDate(review.replied_at)}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ReplyReviewDialog({
  review,
  open,
  onClose,
  onSubmit,
  isLoading,
  error,
}: {
  review: ShopReview | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (reply: string) => void;
  isLoading: boolean;
  error: string;
}) {
  const titleId = useId();
  const replyFieldId = useId();
  const [reply, setReply] = useState(review?.shop_reply ?? "");
  const [localError, setLocalError] = useState("");

  useDialogLock(open, onClose);

  if (!open || !review) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = reply.trim();
    if (!trimmed) {
      setLocalError("اكتب محتوى الرد قبل الإرسال.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center p-4" role="presentation">
      <button type="button" aria-label="إغلاق نافذة الرد" className="absolute inset-0 bg-primary/45 backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-[#0a0a0a]">
              رد على التقييم
            </h2>
            <p className="mt-1 text-sm text-[#777]">{review.user.name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#777] transition hover:bg-[#f3f3f3] hover:text-primary" aria-label="إغلاق">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-primary/10 bg-primary-light/40 px-4 py-3 text-sm">
          <StarRating rating={review.rating} starClassName="size-3.5" />
          <p className="mt-2 text-gray-700">{review.comment || "بدون تعليق"}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor={replyFieldId} className="mb-1.5 block text-sm font-medium text-primary">
              نص الرد
            </label>
            <textarea
              id={replyFieldId}
              value={reply}
              onChange={(event) => {
                setReply(event.target.value);
                if (localError) setLocalError("");
              }}
              rows={4}
              placeholder="اكتب ردك على تقييم العميل..."
              className="w-full resize-y rounded-lg border border-primary/15 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
            {localError || error ? (
              <p className="mt-1.5 text-xs text-red-600" role="alert">
                {localError || error}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={onClose} disabled={isLoading} className="rounded-lg border border-primary/15 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-70">
              إلغاء
            </button>
            <button type="submit" disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:brightness-95 disabled:opacity-70">
              <Reply className="size-3.5" aria-hidden="true" />
              {isLoading ? "جاري الإرسال..." : "إرسال الرد"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewsWorkshopPage() {
  const { data, isLoading, isError, error } = useGetShopOwnerReviewsQuery();
  const [replyReview, { isLoading: isReplying }] = useReplyShopOwnerReviewMutation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyError, setReplyError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const reviews = data?.reviews ?? [];
  const selectedReview = reviews.find((item) => item.id === selectedId) ?? null;
  const replyTarget = reviews.find((item) => item.id === replyId) ?? null;

  const handleReplySubmit = async (reply: string) => {
    if (!replyId) return;
    setReplyError("");
    try {
      await replyReview({ id: replyId, reply }).unwrap();
      setReplyId(null);
      setSuccessOpen(true);
    } catch (err) {
      const errorData = (err as { data?: AuthValidationErrorResponse })?.data;
      setReplyError(errorData?.message || "تعذر إرسال الرد.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-primary">التقييمات والتعليقات</h1>
            <p className="mt-1 text-sm text-gray-600">تقييمات العملاء على ورشتك مع إمكانية الرد عليها.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg border border-primary/10 bg-primary-light/50 px-4 py-2 text-center">
              <p className="text-xs text-gray-500">متوسط التقييم</p>
              <p className="inline-flex items-center gap-1 text-lg font-bold text-primary">
                <Star className="size-4 fill-secondary text-secondary" aria-hidden="true" />
                {(data?.average_rating ?? 0).toFixed(1)}
              </p>
            </div>
            <div className="rounded-lg border border-primary/10 bg-primary-light/50 px-4 py-2 text-center">
              <p className="text-xs text-gray-500">إجمالي التقييمات</p>
              <p className="text-lg font-bold text-primary">{data?.reviews_count ?? 0}</p>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <p className="text-sm text-gray-500" role="status">
          جاري تحميل التقييمات...
        </p>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {(error as { data?: AuthValidationErrorResponse })?.data?.message || "تعذر تحميل التقييمات."}
        </div>
      ) : null}

      {!isLoading && !isError && reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">لا توجد تقييمات حالياً</p>
          <p className="mt-1 text-xs text-gray-500">ستظهر هنا تقييمات العملاء بعد إضافتها</p>
        </div>
      ) : null}

      {!isLoading && reviews.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-primary-light/60 text-start text-xs font-semibold uppercase tracking-wide text-primary">
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    العميل
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    التقييم
                  </th>
                  <th scope="col" className="hidden max-w-xs px-4 py-3.5 lg:table-cell sm:px-6">
                    التعليق
                  </th>
                  <th scope="col" className="hidden whitespace-nowrap px-4 py-3.5 md:table-cell sm:px-6">
                    التاريخ
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الحالة
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {reviews.map((item) => (
                  <tr key={item.id} className="transition hover:bg-primary-light/30">
                    <td className="whitespace-nowrap px-4 py-4 text-gray-700 sm:px-6">{item.user.name}</td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      <StarRating rating={item.rating} starClassName="size-3.5" />
                    </td>
                    <td className="hidden max-w-xs truncate px-4 py-4 text-gray-600 lg:table-cell sm:px-6">{item.comment || "—"}</td>
                    <td className="hidden whitespace-nowrap px-4 py-4 text-gray-600 md:table-cell sm:px-6">{formatReviewDate(item.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      {item.shop_reply ? (
                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">تم الرد</span>
                      ) : (
                        <span className="inline-flex rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">بانتظار الرد</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      <div className="inline-flex items-center overflow-hidden rounded-lg border border-primary/10 bg-white shadow-sm" role="group" aria-label={`إجراءات تقييم ${item.id}`}>
                        <button
                          type="button"
                          title="تفاصيل"
                          aria-label={`عرض تفاصيل التقييم ${item.id}`}
                          onClick={() => setSelectedId(item.id)}
                          className="inline-flex size-8 items-center justify-center text-primary transition hover:bg-primary-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
                        >
                          <Eye className="size-3.5" aria-hidden="true" />
                        </button>
                        <span className="h-4 w-px bg-primary/10" aria-hidden="true" />
                        <button
                          type="button"
                          title="رد"
                          aria-label={`الرد على التقييم ${item.id}`}
                          onClick={() => {
                            setReplyError("");
                            setReplyId(item.id);
                          }}
                          className="inline-flex size-8 items-center justify-center text-secondary transition hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
                        >
                          <Reply className="size-3.5" aria-hidden="true" />
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

      <ReviewDetailsDialog review={selectedReview} open={selectedId !== null} onClose={() => setSelectedId(null)} />
      <ReplyReviewDialog
        key={replyId ?? "closed"}
        review={replyTarget}
        open={replyId !== null}
        onClose={() => {
          if (!isReplying) {
            setReplyId(null);
            setReplyError("");
          }
        }}
        onSubmit={handleReplySubmit}
        isLoading={isReplying}
        error={replyError}
      />
      <SuccessToast open={successOpen} title="تم إرسال الرد" message="تم حفظ ردك على التقييم بنجاح." onClose={() => setSuccessOpen(false)} />
    </div>
  );
}

export default ReviewsWorkshopPage;
