export type WorkshopOrderStatus = "pending" | "approved" | "rejected";

export type WorkshopOrder = {
  id: string;
  customerName: string;
  service: string;
  vehicle: string;
  date: string;
  status: WorkshopOrderStatus;
};

export const orderStatusLabels: Record<WorkshopOrderStatus, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};
