import { useState } from "react";
import { mockWorkshopOrders } from "../data/workshopOrders.mock";
import type { WorkshopOrder } from "../types/workshopOrder";
import { OrdersTable } from "./OrdersTable";

function OrdersWorkshopPage() {
  const [orders, setOrders] = useState<WorkshopOrder[]>(mockWorkshopOrders);

  const pendingCount = orders.filter((order) => order.status === "pending").length;

  const handleApprove = (id: string) => {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status: "approved" } : order)),
    );
  };

  const handleReject = (id: string) => {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status: "rejected" } : order)),
    );
  };

  const handleDelete = (id: string) => {
    setOrders((current) => current.filter((order) => order.id !== id));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-primary">الطلبات</h1>
            <p className="mt-1 text-sm text-gray-600">
              إدارة طلبات العملاء — موافقة، رفض، أو حذف الطلبات الواردة للورشة.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-lg border border-primary/10 bg-primary-light/50 px-4 py-2 text-center">
              <p className="text-xs text-gray-500">إجمالي الطلبات</p>
              <p className="text-lg font-bold text-primary">{orders.length}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-center">
              <p className="text-xs text-amber-700">بانتظار المراجعة</p>
              <p className="text-lg font-bold text-amber-800">{pendingCount}</p>
            </div>
          </div>
        </div>
      </section>

      <OrdersTable
        orders={orders}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default OrdersWorkshopPage;
