import { useId, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Pencil, Star, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import SuccessToast from "../../../components/SuccessToast";
import { useAppSelector } from "../../../store/hooks";
import type { AuthValidationErrorResponse, ShopReview } from "../../../types/authTypes";
import {
  useDeleteReviewMutation,
  useGetShopReviewsQuery,
  useStoreReviewMutation,
  useUpdateReviewMutation,
} from "../../auth/authApi";
import { StarRating } from "../components/StarRating";
import type { WorkshopDetails } from "./types";

type WorkshopReviewsTabProps = {
  workshop: WorkshopDetails;
};

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

function isOwnReview(
  review: ShopReview,
  user: { id?: string | number; first_name: string; last_name: string } | null,
) {
  if (!user) return false;
  if (user.id != null && user.id !== "" && review.user.id) {
    return String(review.user.id) === String(user.id);
  }
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  return Boolean(fullName) && review.user.name.trim() === fullName;
}

export function WorkshopReviewsTab({ workshop }: WorkshopReviewsTabProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  const { data, isLoading, isError, error } = useGetShopReviewsQuery(workshop.id, { skip: !workshop.id });
  const [storeReview, { isLoading: isStoring }] = useStoreReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const commentId = useId();
  const isSubmitting = isStoring || isUpdating;

  const reviews = data?.reviews ?? [];
  const averageRating = data?.average_rating ?? workshop.rating;
  const reviewsCount = data?.reviews_count ?? workshop.reviewCount;
  const distribution = data?.rating_distribution;
  const myReview = user ? reviews.find((item) => isOwnReview(item, user)) : undefined;

  const distributionRows = ([5, 4, 3, 2, 1] as const).map((stars) => {
    const count = distribution ? Number(distribution[String(stars) as keyof typeof distribution] ?? 0) : 0;
    const percentage = reviewsCount > 0 ? Math.round((count / reviewsCount) * 100) : 0;
    return { stars, percentage, count };
  });

  const requireAuth = () => {
    navigate("/login", { state: { from: location.pathname } });
  };

  const startEdit = (review: ShopReview) => {
    setEditingId(review.id);
    setRating(review.rating || 5);
    setComment(review.comment);
    setFormError("");
  };

  const resetForm = () => {
    setEditingId(null);
    setRating(5);
    setComment("");
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (!token) {
      requireAuth();
      return;
    }

    if (rating < 1 || rating > 5) {
      setFormError("اختر تقييماً من 1 إلى 5.");
      return;
    }

    const trimmed = comment.trim();
    if (!trimmed) {
      setFormError("اكتب تعليقاً قبل الإرسال.");
      return;
    }

    try {
      if (editingId) {
        await updateReview({ id: editingId, shopId: workshop.id, rating, comment: trimmed }).unwrap();
        setSuccessMessage("تم تحديث تقييمك بنجاح.");
      } else {
        await storeReview({ shopId: workshop.id, rating, comment: trimmed }).unwrap();
        setSuccessMessage("تم إضافة تقييمك بنجاح.");
      }
      resetForm();
      setSuccessOpen(true);
    } catch (err) {
      const errorData = (err as { data?: AuthValidationErrorResponse })?.data;
      setFormError(errorData?.message || (editingId ? "تعذر تحديث التقييم." : "تعذر إضافة التقييم."));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleteError("");
    try {
      await deleteReview({ id: deleteId, shopId: workshop.id }).unwrap();
      if (editingId === deleteId) resetForm();
      setDeleteId(null);
      setSuccessMessage("تم حذف التقييم بنجاح.");
      setSuccessOpen(true);
    } catch (err) {
      const errorData = (err as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "تعذر حذف التقييم.");
    }
  };

  const unauthorized = Boolean(error && "status" in error && error.status === 401);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#ebebeb] bg-[#fafafa] p-4 sm:p-5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center text-center lg:shrink-0">
            <p className="text-4xl font-bold text-[#222]">{averageRating.toFixed(1)}</p>
            <StarRating rating={averageRating} starClassName="size-3" />
            <p className="mt-1 text-xs text-[#888]">{reviewsCount} تقييم</p>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            {distributionRows.map((item) => (
              <div key={item.stars} className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-xs text-[#666]">{item.stars}</span>
                <Star className="size-2.5 shrink-0 fill-secondary text-secondary" aria-hidden="true" />
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#ebebeb]">
                  <div className="me-auto h-full rounded-full bg-secondary" style={{ width: `${item.percentage}%` }} />
                </div>
                <span className="w-8 shrink-0 text-xs text-[#888]">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {token ? (
        <form onSubmit={handleSubmit} className="rounded-lg border border-[#ebebeb] bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-primary">{editingId ? "تعديل تقييمك" : myReview && !editingId ? "لديك تقييم لهذه الورشة" : "أضف تقييمك"}</h3>
            {myReview && !editingId ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(myReview)}
                  className="inline-flex items-center gap-1 rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary-light/50"
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setDeleteId(myReview.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  حذف
                </button>
              </div>
            ) : null}
          </div>

          {!myReview || editingId ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium text-[#666]">التقييم</p>
                <StarRating rating={rating} interactive onChange={setRating} starClassName="size-6" />
              </div>
              <div>
                <label htmlFor={commentId} className="mb-1.5 block text-xs font-medium text-[#666]">
                  التعليق
                </label>
                <textarea
                  id={commentId}
                  value={comment}
                  onChange={(event) => {
                    setComment(event.target.value);
                    if (formError) setFormError("");
                  }}
                  rows={3}
                  placeholder="شاركنا تجربتك مع الورشة..."
                  className="w-full resize-y rounded-lg border border-[#ebebeb] px-3 py-2.5 text-sm text-[#333] outline-none transition placeholder:text-[#aaa] focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              {formError ? (
                <p className="text-xs text-red-600" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "جاري الحفظ..." : editingId ? "حفظ التعديل" : "نشر التقييم"}
                </button>
                {editingId ? (
                  <button type="button" onClick={resetForm} className="rounded-lg border border-[#ebebeb] px-4 py-2 text-sm font-medium text-[#666] transition hover:bg-[#fafafa]">
                    إلغاء
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </form>
      ) : (
        <div className="rounded-lg border border-dashed border-[#ebebeb] bg-[#fafafa] px-4 py-5 text-center">
          <p className="text-sm text-[#666]">سجّل دخولك لإضافة تقييم أو عرض التفاصيل الكاملة.</p>
          <Link to="/login" state={{ from: location.pathname }} className="mt-3 inline-flex rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:brightness-95">
            تسجيل الدخول
          </Link>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-[#888]" role="status">
          جاري تحميل التقييمات...
        </p>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {unauthorized ? "يجب تسجيل الدخول لعرض تقييمات هذه الورشة." : "تعذر تحميل التقييمات. حاول لاحقاً."}
        </div>
      ) : null}

      {!isLoading && !isError && reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#ebebeb] px-4 py-8 text-center">
          <p className="text-sm font-medium text-primary">لا توجد تقييمات بعد</p>
          <p className="mt-1 text-xs text-[#888]">كن أول من يقيّم هذه الورشة</p>
        </div>
      ) : null}

      <div className="divide-y divide-[#ebebeb]">
        {reviews.map((review) => {
          const own = isOwnReview(review, user);
          return (
            <article key={review.id} className="py-4 first:pt-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden="true">
                    {review.user.name.charAt(0) || "م"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#2a2a2a]">
                      {review.user.name}
                      {own ? <span className="ms-2 text-[10px] font-semibold text-secondary">تقييمك</span> : null}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StarRating rating={review.rating} starClassName="size-3" />
                      <span className="text-xs text-[#aaa]">{formatReviewDate(review.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {review.comment ? <p className="mt-3 text-sm leading-relaxed text-[#525252]">{review.comment}</p> : null}

              {review.shop_reply ? (
                <div className="mt-3 rounded-lg border border-primary/10 bg-primary-light/40 px-3 py-2.5">
                  <p className="text-[11px] font-semibold text-primary">رد الورشة</p>
                  <p className="mt-1 text-sm text-[#444]">{review.shop_reply}</p>
                  {review.replied_at ? <p className="mt-1 text-[11px] text-[#999]">{formatReviewDate(review.replied_at)}</p> : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="حذف التقييم"
        message="هل أنت متأكد من حذف تقييمك؟ لا يمكن التراجع عن هذا الإجراء."
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

      <SuccessToast open={successOpen} title="تم بنجاح" message={successMessage} onClose={() => setSuccessOpen(false)} />
    </div>
  );
}
