import { useState } from "react";
import { Calendar, Check, FileImage, IdCard, Mail, MapPin, Phone, Trash2, UserCheck, Wrench, X } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import SuccessToast from "../../../components/SuccessToast";
import { useApproveShopOwnerVerificationMutation, useDeleteShopOwnerVerificationMutation, useGetShopOwnerVerificationDataQuery, useRejectShopOwnerVerificationMutation } from "../../auth/authApi";
import type { AuthValidationErrorResponse, ShopOwnerVerificationRequest, ShopOwnerVerificationStatus } from "../../../types/authTypes";

const EMPTY_REQUESTS: never[] = [];

const statusStyles: Record<ShopOwnerVerificationStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  accepted: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
};

const statusLabels: Record<ShopOwnerVerificationStatus, string> = {
  pending: "قيد المراجعة",
  accepted: "مقبول",
  rejected: "مرفوض",
};

function formatRequestDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function WorkshopOwnerRequestsPage() {
  const { data, isLoading, isError, isFetching } = useGetShopOwnerVerificationDataQuery();
  const [approveShopOwnerVerification, { isLoading: isApproving }] = useApproveShopOwnerVerificationMutation();
  const [rejectShopOwnerVerification, { isLoading: isRejecting }] = useRejectShopOwnerVerificationMutation();
  const [deleteShopOwnerVerification, { isLoading: isDeleting }] = useDeleteShopOwnerVerificationMutation();
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ShopOwnerVerificationStatus>>({});
  const [deleteTarget, setDeleteTarget] = useState<ShopOwnerVerificationRequest | null>(null);
  const [actionId, setActionId] = useState<string | number | null>(null);
  const [actionError, setActionError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isActionLoading = isApproving || isRejecting || isDeleting;

  const requests = (data?.data ?? EMPTY_REQUESTS).map((request) => {
    const override = statusOverrides[String(request.id)];
    return override ? { ...request, status: override } : request;
  });

  const handleApprove = async (id: string | number) => {
    if (isActionLoading) return;

    setActionError("");
    setActionId(id);

    try {
      const result = await approveShopOwnerVerification(id).unwrap();
      setStatusOverrides((current) => ({ ...current, [String(id)]: "accepted" }));
      setSuccessMessage(result.message || "تم قبول الطلب بنجاح");
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setActionError(errorData?.message || "تعذر قبول الطلب، حاول مرة أخرى.");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string | number) => {
    if (isActionLoading) return;

    setActionError("");
    setActionId(id);

    try {
      const result = await rejectShopOwnerVerification(id).unwrap();
      setStatusOverrides((current) => ({ ...current, [String(id)]: "rejected" }));
      setSuccessMessage(result.message || "تم رفض الطلب بنجاح");
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setActionError(errorData?.message || "تعذر رفض الطلب، حاول مرة أخرى.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return;

    setDeleteError("");

    try {
      const result = await deleteShopOwnerVerification(deleteTarget.id).unwrap();
      setSuccessMessage(result.message || "تم حذف الطلب بنجاح");
      setDeleteTarget(null);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "تعذر حذف الطلب، حاول مرة أخرى.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-primary">طلبات تسجيل أصحاب الورش</h1>
        <p className="mt-1 text-sm text-gray-500">مراجعة بيانات التسجيل وقبول الطلب أو رفضه أو حذفه</p>
      </div>

      {actionError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {actionError}
        </p>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-primary/10 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-primary/70" role="status">
            جاري تحميل الطلبات...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm" role="alert">
          <p className="text-sm font-medium text-red-700">تعذر تحميل الطلبات</p>
          <p className="mt-1 text-xs text-red-600">حاول تحديث الصفحة أو المحاولة لاحقاً.</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">{isFetching ? "جاري تحديث القائمة..." : "لا توجد طلبات"}</p>
          <p className="mt-1 text-xs text-gray-500">ستظهر هنا طلبات تسجيل أصحاب الورش عند إرسالها</p>
        </div>
      ) : (
        <div className="space-y-4">
          {isFetching ? (
            <p className="rounded-lg border border-primary/10 bg-primary-light/40 px-4 py-2 text-center text-xs text-primary/70" role="status">
              جاري تحديث القائمة...
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {requests.map((request) => {
              const canReview = request.status === "pending";
              const createdAt = formatRequestDate(request.created_at);
              const reviewedAt = formatRequestDate(request.reviewed_at);
              const isThisAction = actionId === request.id;

              return (
                <article key={request.id} className="rounded-xl border border-primary/10 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold text-primary">{request.full_name}</h2>
                      <p className="mt-1 text-xs text-gray-400">طلب تسجيل كصاحب ورشة</p>
                    </div>
                    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[request.status]}`}>
                      {statusLabels[request.status]}
                    </span>
                  </div>

                  {request.reviewed_by || reviewedAt ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-primary/10 bg-primary-light/50 px-3 py-2">
                      {request.reviewed_by ? (
                        <>
                          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserCheck className="size-3.5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] text-gray-500">راجعه</p>
                            <p className="truncate text-sm font-medium text-primary">{request.reviewed_by}</p>
                          </div>
                        </>
                      ) : null}
                      {reviewedAt ? (
                        <span className="ms-auto text-[11px] text-gray-500">
                          {request.status === "rejected" ? "تاريخ الرفض" : "تاريخ القبول"}:{" "}
                          <span className="font-medium text-primary">{reviewedAt}</span>
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  <dl className="mt-4 space-y-2.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="size-4 shrink-0 text-primary/40" aria-hidden="true" />
                      <dt className="sr-only">البريد الإلكتروني</dt>
                      <dd>{request.email}</dd>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="size-4 shrink-0 text-primary/40" aria-hidden="true" />
                      <dt className="sr-only">رقم الهاتف</dt>
                      <dd dir="ltr">{request.phone_number || "—"}</dd>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="size-4 shrink-0 text-primary/40" aria-hidden="true" />
                      <dt className="sr-only">الدولة</dt>
                      <dd>{request.country}</dd>
                    </div>
                    {createdAt ? (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="size-4 shrink-0 text-primary/40" aria-hidden="true" />
                        <dt className="text-gray-500">تاريخ الطلب:</dt>
                        <dd>{createdAt}</dd>
                      </div>
                    ) : null}
                    <div className="flex items-start gap-2 text-gray-700">
                      <Wrench className="mt-0.5 size-4 shrink-0 text-primary/40" aria-hidden="true" />
                      <div>
                        <dt className="text-xs text-gray-400">الخدمات</dt>
                        <dd className="mt-1 flex flex-wrap gap-1.5">
                          {request.services.length > 0 ? (
                            request.services.map((service) => (
                              <span key={service} className="rounded-md bg-secondary/10 px-2 py-0.5 text-[11px] text-gray-800">
                                {service}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">لا توجد خدمات</span>
                          )}
                        </dd>
                      </div>
                    </div>
                    {request.notes ? (
                      <div>
                        <dt className="text-xs text-gray-400">ملاحظة</dt>
                        <dd className="mt-1 text-gray-700">{request.notes}</dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-dashed border-primary/20 bg-primary-light/40 p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                        <IdCard className="size-3.5" aria-hidden="true" />
                        صورة الهوية
                      </p>
                      {request.national_id_image ? (
                        <a href={request.national_id_image} target="_blank" rel="noopener noreferrer" className="block">
                          <img src={request.national_id_image} alt={`هوية ${request.full_name}`} className="h-24 w-full rounded-md object-cover" />
                        </a>
                      ) : (
                        <p className="py-4 text-center text-xs text-gray-400">لا توجد صورة</p>
                      )}
                    </div>
                    <div className="rounded-lg border border-dashed border-primary/20 bg-primary-light/40 p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                        <FileImage className="size-3.5" aria-hidden="true" />
                        ترخيص المحل
                      </p>
                      {request.commercial_record_image ? (
                        <a href={request.commercial_record_image} target="_blank" rel="noopener noreferrer" className="block">
                          <img src={request.commercial_record_image} alt={`ترخيص ${request.full_name}`} className="h-24 w-full rounded-md object-cover" />
                        </a>
                      ) : (
                        <p className="py-4 text-center text-xs text-gray-400">لا توجد صورة</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                    {canReview ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(request.id)}
                          disabled={isActionLoading}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Check className="size-3.5" aria-hidden="true" />
                          {isThisAction && isApproving ? "جاري القبول..." : "قبول"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(request.id)}
                          disabled={isActionLoading}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <X className="size-3.5" aria-hidden="true" />
                          {isThisAction && isRejecting ? "جاري الرفض..." : "رفض"}
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError("");
                        setDeleteTarget(request);
                      }}
                      disabled={isActionLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      حذف
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <SuccessToast open={Boolean(successMessage)} message={successMessage} onClose={() => setSuccessMessage("")} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف الطلب"
        message={deleteTarget ? `هل تريد حذف طلب ${deleteTarget.full_name}؟` : ""}
        confirmLabel="حذف"
        variant="danger"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (isDeleting) return;
          setDeleteError("");
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export default WorkshopOwnerRequestsPage;
