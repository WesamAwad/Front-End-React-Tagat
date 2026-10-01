import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import SuccessToast from "../../../components/SuccessToast";
import { SHOP_REPAIR_REQUEST_CREATED_DOM_EVENT, type ShopRepairRequestCreatedDetail } from "../../../services/listenShopRepairRequests";
import type { AuthValidationErrorResponse, RepairRequest } from "../../../types/authTypes";
import {
  useApproveRepairRequestMutation,
  useCompleteRepairRequestMutation,
  useDeleteRepairRequestMutation,
  useGetAllRepairRequestsQuery,
  useRejectRepairRequestMutation,
} from "../../auth/authApi";
import { formatRepairRequestCustomer } from "../types/workshopOrder";
import { OrdersTable } from "./OrdersTable";

const EMPTY_REQUESTS: RepairRequest[] = [];

function OrdersWorkshopPage() {
  const [liveNotice, setLiveNotice] = useState<ShopRepairRequestCreatedDetail | null>(null);
  const { data, isLoading, isFetching, isError, refetch } = useGetAllRepairRequestsQuery();
  const [approveRepairRequest, { isLoading: isAccepting }] = useApproveRepairRequestMutation();
  const [rejectRepairRequest, { isLoading: isRejecting }] = useRejectRepairRequestMutation();
  const [completeRepairRequest, { isLoading: isCompleting }] = useCompleteRepairRequestMutation();
  const [deleteRepairRequest, { isLoading: isDeleting }] = useDeleteRepairRequestMutation();

  const requests = data?.data ?? EMPTY_REQUESTS;
  const pendingCount = requests.filter((request) => request.status.trim().toLowerCase() === "pending").length;

  const [acceptTarget, setAcceptTarget] = useState<RepairRequest | null>(null);
  const [acceptError, setAcceptError] = useState("");
  const [rejectTarget, setRejectTarget] = useState<RepairRequest | null>(null);
  const [rejectError, setRejectError] = useState("");
  const [completeTarget, setCompleteTarget] = useState<RepairRequest | null>(null);
  const [completeError, setCompleteError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<RepairRequest | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const handleCreated = (event: Event) => {
      const detail = (event as CustomEvent<ShopRepairRequestCreatedDetail>).detail;
      setLiveNotice({
        message: detail?.message || "لديك طلب صيانة جديد.",
        repairRequestId: detail?.repairRequestId || "",
      });
    };

    window.addEventListener(SHOP_REPAIR_REQUEST_CREATED_DOM_EVENT, handleCreated);
    return () => window.removeEventListener(SHOP_REPAIR_REQUEST_CREATED_DOM_EVENT, handleCreated);
  }, []);

  useEffect(() => {
    if (!liveNotice) return;

    const timeoutId = window.setTimeout(() => setLiveNotice(null), 8000);
    return () => window.clearTimeout(timeoutId);
  }, [liveNotice]);

  const confirmAccept = async () => {
    if (!acceptTarget || isAccepting) return;

    setAcceptError("");

    try {
      const result = await approveRepairRequest(acceptTarget.id).unwrap();
      setAcceptTarget(null);
      setSuccessMessage(result.message || "تم قبول الطلب بنجاح");
      setShowSuccess(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setAcceptError(errorData?.message || "تعذر قبول الطلب، حاول مرة أخرى.");
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget || isRejecting) return;

    setRejectError("");

    try {
      const result = await rejectRepairRequest(rejectTarget.id).unwrap();
      setRejectTarget(null);
      setSuccessMessage(result.message || "تم رفض الطلب بنجاح");
      setShowSuccess(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setRejectError(errorData?.message || "تعذر رفض الطلب، حاول مرة أخرى.");
    }
  };

  const confirmComplete = async () => {
    if (!completeTarget || isCompleting) return;

    setCompleteError("");

    try {
      const result = await completeRepairRequest(completeTarget.id).unwrap();
      setCompleteTarget(null);
      setSuccessMessage(result.message || "تم تعليم الطلب كمكتمل بنجاح");
      setShowSuccess(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setCompleteError(errorData?.message || "تعذر تعليم الطلب كمكتمل، حاول مرة أخرى.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setDeleteError("");

    try {
      const result = await deleteRepairRequest(deleteTarget.id).unwrap();
      setDeleteTarget(null);
      setSuccessMessage(result.message || "تم حذف الطلب بنجاح");
      setShowSuccess(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "تعذر حذف الطلب، حاول مرة أخرى.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-primary">طلبات الإصلاح</h1>
            <p className="mt-1 text-sm text-gray-600">الطلبات الواردة من العملاء (الجهاز، الخدمة، الوصف، وبيانات التواصل).</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-lg border border-primary/10 bg-primary-light/50 px-4 py-2 text-center">
              <p className="text-xs text-gray-500">إجمالي الطلبات</p>
              <p className="text-lg font-bold text-primary">{isLoading ? "—" : requests.length}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-center">
              <p className="text-xs text-amber-700">بانتظار المراجعة</p>
              <p className="text-lg font-bold text-amber-800">{isLoading ? "—" : pendingCount}</p>
            </div>
          </div>
        </div>
      </section>

      {liveNotice ? (
        <div className="pointer-events-none fixed top-4 right-4 z-2000 w-[min(100%-2rem,22rem)]">
          <div role="status" aria-live="polite" className="pointer-events-auto flex items-start gap-3 rounded-xl border border-amber-200 bg-white p-4 shadow-lg">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Bell className="size-5 text-amber-700" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 text-start">
              <p className="text-sm font-bold text-primary">طلب إصلاح جديد</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{liveNotice.message}</p>
            </div>
            <button type="button" onClick={() => setLiveNotice(null)} className="rounded-lg p-1 text-gray-500 transition hover:bg-primary-light hover:text-primary" aria-label="إغلاق الإشعار">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-3 rounded-xl border border-primary/10 bg-white p-6 shadow-sm" aria-busy="true">
          <p className="text-sm text-gray-500">جاري تحميل الطلبات...</p>
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-10 animate-pulse rounded-lg bg-primary-light/60" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center" role="alert">
          <p className="text-sm font-medium text-red-700">تعذر تحميل الطلبات</p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetching ? "جاري المحاولة..." : "إعادة المحاولة"}
          </button>
        </div>
      ) : (
        <OrdersTable
          requests={requests}
          highlightedRequestId={liveNotice?.repairRequestId || ""}
          onAccept={(id) => {
            setAcceptError("");
            setAcceptTarget(requests.find((request) => request.id === id) ?? null);
          }}
          onReject={(id) => {
            setRejectError("");
            setRejectTarget(requests.find((request) => request.id === id) ?? null);
          }}
          onComplete={(id) => {
            setCompleteError("");
            setCompleteTarget(requests.find((request) => request.id === id) ?? null);
          }}
          onDelete={(id) => {
            setDeleteError("");
            setDeleteTarget(requests.find((request) => request.id === id) ?? null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(acceptTarget)}
        title="قبول الطلب"
        message={acceptTarget ? `هل تريد قبول طلب «${formatRepairRequestCustomer(acceptTarget)}»؟ سيتم إشعار العميل بقبول طلبه.` : ""}
        confirmLabel="قبول"
        loadingLabel="جاري القبول..."
        cancelLabel="إلغاء"
        isLoading={isAccepting}
        error={acceptError}
        onConfirm={confirmAccept}
        onCancel={() => {
          if (isAccepting) return;
          setAcceptTarget(null);
          setAcceptError("");
        }}
      />

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        title="رفض الطلب"
        message={rejectTarget ? `هل تريد رفض طلب «${formatRepairRequestCustomer(rejectTarget)}»؟ سيتم إشعار العميل برفض طلبه.` : ""}
        confirmLabel="رفض"
        loadingLabel="جاري الرفض..."
        cancelLabel="إلغاء"
        variant="danger"
        isLoading={isRejecting}
        error={rejectError}
        onConfirm={confirmReject}
        onCancel={() => {
          if (isRejecting) return;
          setRejectTarget(null);
          setRejectError("");
        }}
      />

      <ConfirmDialog
        open={Boolean(completeTarget)}
        title="إكمال الطلب"
        message={completeTarget ? `هل تريد تعليم طلب «${formatRepairRequestCustomer(completeTarget)}» كمكتمل؟ سيتم إشعار العميل.` : ""}
        confirmLabel="مكتمل"
        loadingLabel="جاري التحديث..."
        cancelLabel="إلغاء"
        isLoading={isCompleting}
        error={completeError}
        onConfirm={confirmComplete}
        onCancel={() => {
          if (isCompleting) return;
          setCompleteTarget(null);
          setCompleteError("");
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف الطلب"
        message={deleteTarget ? `هل تريد حذف طلب «${formatRepairRequestCustomer(deleteTarget)}»؟ لا يمكن التراجع عن هذا الإجراء.` : ""}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (isDeleting) return;
          setDeleteTarget(null);
          setDeleteError("");
        }}
      />

      <SuccessToast open={showSuccess} message={successMessage} onClose={() => setShowSuccess(false)} />
    </div>
  );
}

export default OrdersWorkshopPage;
