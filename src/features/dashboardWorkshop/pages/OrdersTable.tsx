import { Check, Trash2, X } from "lucide-react";
import type { WorkshopOrder, WorkshopOrderStatus } from "../types/workshopOrder";
import { orderStatusLabels } from "../types/workshopOrder";

const statusStyles: Record<WorkshopOrderStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
};

type OrdersTableProps = {
  orders: WorkshopOrder[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
};

function formatOrderDate(date: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function OrdersTable({ orders, onApprove, onReject, onDelete }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
        <p className="text-sm font-medium text-primary">لا توجد طلبات حالياً</p>
        <p className="mt-1 text-xs text-gray-500">ستظهر الطلبات الجديدة هنا عند وصولها</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-primary/10 bg-primary-light/60 text-start text-xs font-semibold uppercase tracking-wide text-primary">
              <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                رقم الطلب
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                العميل
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                الخدمة
              </th>
              <th scope="col" className="hidden whitespace-nowrap px-4 py-3.5 md:table-cell sm:px-6">
                الجهاز
              </th>
              <th scope="col" className="hidden whitespace-nowrap px-4 py-3.5 lg:table-cell sm:px-6">
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
            {orders.map((order) => (
              <tr key={order.id} className="transition hover:bg-primary-light/30">
                <td className="whitespace-nowrap px-4 py-4 font-medium text-primary sm:px-6">
                  {order.id}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-gray-700 sm:px-6">{order.customerName}</td>
                <td className="max-w-48 truncate px-4 py-4 text-gray-700 sm:max-w-none sm:px-6">
                  {order.service}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-4 text-gray-600 md:table-cell sm:px-6">
                  {order.vehicle}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-4 text-gray-600 lg:table-cell sm:px-6">
                  {formatOrderDate(order.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[order.status]}`}
                  >
                    {orderStatusLabels[order.status]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      aria-label={`موافقة على الطلب ${order.id}`}
                      disabled={order.status === "approved"}
                      onClick={() => onApprove(order.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-40"
                    >
                      <Check className="size-3.5 shrink-0" aria-hidden="true" />
                      موافقة
                    </button>
                    <button
                      type="button"
                      aria-label={`رفض الطلب ${order.id}`}
                      disabled={order.status === "rejected"}
                      onClick={() => onReject(order.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                    >
                      <X className="size-3.5 shrink-0" aria-hidden="true" />
                      رفض
                    </button>
                    <button
                      type="button"
                      aria-label={`حذف الطلب ${order.id}`}
                      onClick={() => onDelete(order.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-3.5 shrink-0" aria-hidden="true" />
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
