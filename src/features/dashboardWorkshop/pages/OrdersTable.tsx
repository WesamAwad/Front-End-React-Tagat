import { useEffect, useId, useState } from "react";
import { Check, CheckCircle2, Eye, ImageIcon, Trash2, X, XCircle } from "lucide-react";
import type { RepairRequest } from "../../../types/authTypes";
import {
  formatRepairRequestCustomer,
  formatRepairRequestDate,
  formatRepairRequestStatus,
  repairRequestStatusStyle,
} from "../types/workshopOrder";

type OrdersTableProps = {
  requests: RepairRequest[];
  highlightedRequestId?: string;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
};

function isRequestPending(request: RepairRequest) {
  const status = request.status.trim().toLowerCase();
  return status === "" || status === "pending";
}

function isRequestAccepted(request: RepairRequest) {
  const status = request.status.trim().toLowerCase();
  return status === "accepted" || status === "approved";
}

function RequestDetailsDialog({ request, open, onClose }: { request: RepairRequest | null; open: boolean; onClose: () => void }) {
  const titleId = useId();

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

  if (!open || !request) return null;

  const detailRows = [
    { label: "الجهاز", value: request.device_model?.name || "—" },
    { label: "الخدمة", value: request.service?.name || "—" },
    { label: "الوصف", value: request.description || "—" },
    { label: "الاسم", value: formatRepairRequestCustomer(request) },
    { label: "البريد الإلكتروني", value: request.customer?.email || "—" },
    { label: "رقم الجوال", value: request.phone_number || "—" },
    { label: "العنوان", value: request.address || "—" },
    { label: "التاريخ", value: formatRepairRequestDate(request.created_at) },
  ];

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center p-4" role="presentation">
      <button type="button" aria-label="إغلاق تفاصيل الطلب" className="absolute inset-0 bg-primary/45 backdrop-blur-[2px]" onClick={onClose} />

      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-[#0a0a0a]">
              تفاصيل الطلب
            </h2>
            <p className="mt-1 text-sm text-[#777]">#{request.id}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#777] transition hover:bg-[#f3f3f3] hover:text-primary" aria-label="إغلاق">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[#f0f0f0] overflow-hidden rounded-lg border border-[#f0f0f0]">
          {detailRows.map((row) => (
            <div key={row.label} className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
              <dt className="shrink-0 text-sm font-medium text-[#666]">{row.label}</dt>
              <dd className="text-sm text-primary sm:max-w-[65%] sm:text-start">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-[#666]">صورة المشكلة</p>
          {request.image ? (
            <img src={request.image} alt={`صورة طلب الإصلاح ${request.id}`} className="max-h-64 w-full rounded-lg object-contain" loading="lazy" />
          ) : (
            <p className="rounded-lg border border-dashed border-[#e5e5e5] px-4 py-6 text-center text-sm text-[#999]">لا توجد صورة</p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-lg bg-[#fff4eb] px-4 py-3 text-sm">
          <span className="text-[#666]">الحالة</span>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${repairRequestStatusStyle(request.status)}`}>
            {formatRepairRequestStatus(request.status)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function OrdersTable({ requests, highlightedRequestId = "", onAccept, onReject, onComplete, onDelete }: OrdersTableProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const selectedRequest = requests.find((request) => request.id === selectedRequestId) ?? null;

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
        <p className="text-sm font-medium text-primary">لا توجد طلبات حالياً</p>
        <p className="mt-1 text-xs text-gray-500">ستظهر الطلبات الجديدة هنا عند وصولها من صفحة الحجز</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
        <div
          className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
          tabIndex={0}
          role="region"
          aria-label="جدول طلبات الإصلاح (قابل للتمرير أفقياً)"
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-primary/10 bg-primary-light/60 text-start text-xs font-semibold uppercase tracking-wide text-primary">
                <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                  رقم الطلب
                </th>
                <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                  الاسم
                </th>
                <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                  رقم الجوال
                </th>
                <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                  العنوان
                </th>
                <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                  الجهاز
                </th>
                <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                  الخدمة
                </th>
                <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                  الصورة
                </th>
                <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
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
              {requests.map((request) => {
                const isNew = highlightedRequestId !== "" && request.id === highlightedRequestId;

                return (
                <tr key={request.id} className={`transition hover:bg-primary-light/30 ${isNew ? "bg-amber-50" : ""}`}>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-primary sm:px-6">
                    <span>#{request.id}</span>
                    {isNew ? <span className="ms-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-white">جديد</span> : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-gray-700 sm:px-6">{formatRepairRequestCustomer(request)}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6" dir="ltr">
                    {request.phone_number || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6">{request.address || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-gray-700 sm:px-6">{request.device_model?.name || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-gray-700 sm:px-6">{request.service?.name || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6">
                    {request.image ? (
                      <span className="inline-flex items-center gap-1.5">
                        <ImageIcon className="size-3.5 shrink-0 text-secondary" aria-hidden="true" />
                        <span>مرفقة</span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6">{formatRepairRequestDate(request.created_at)}</td>
                  <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${repairRequestStatusStyle(request.status)}`}>
                      {formatRepairRequestStatus(request.status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2" role="group" aria-label={`إجراءات الطلب ${request.id}`}>
                      <button
                        type="button"
                        title="تفاصيل"
                        aria-label={`عرض تفاصيل الطلب ${request.id}`}
                        onClick={() => setSelectedRequestId(request.id)}
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-white text-primary shadow-sm transition hover:bg-primary-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                      >
                        <Eye className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        title="حذف"
                        aria-label={`حذف الطلب ${request.id}`}
                        onClick={() => onDelete(request.id)}
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-white text-gray-500 shadow-sm transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                      {isRequestPending(request) ? (
                        <>
                          <button
                            type="button"
                            aria-label={`قبول الطلب ${request.id}`}
                            onClick={() => onAccept(request.id)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                          >
                            <Check className="size-3.5" aria-hidden="true" />
                            قبول الطلب
                          </button>
                          <button
                            type="button"
                            aria-label={`رفض الطلب ${request.id}`}
                            onClick={() => onReject(request.id)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                          >
                            <XCircle className="size-3.5" aria-hidden="true" />
                            رفض الطلب
                          </button>
                        </>
                      ) : null}
                      {isRequestAccepted(request) ? (
                        <button
                          type="button"
                          aria-label={`تعليم الطلب ${request.id} كمكتمل`}
                          onClick={() => onComplete(request.id)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary-light px-3 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20 transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                          مكتمل
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RequestDetailsDialog request={selectedRequest} open={selectedRequestId !== null} onClose={() => setSelectedRequestId(null)} />
    </>
  );
}
