import type { RepairRequest } from "../../../types/authTypes";

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  accepted: "مقبول",
  approved: "مقبول",
  rejected: "مرفوض",
  completed: "مكتمل",
  canceled: "ملغي",
  cancelled: "ملغي",
};

export const repairRequestStatusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  accepted: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  completed: "bg-primary-light text-primary ring-primary/20",
  canceled: "bg-gray-100 text-gray-600 ring-gray-200",
  cancelled: "bg-gray-100 text-gray-600 ring-gray-200",
};

export function formatRepairRequestStatus(status: string) {
  const key = status.trim().toLowerCase();
  return statusLabels[key] ?? (status.trim() || "—");
}

export function repairRequestStatusStyle(status: string) {
  return repairRequestStatusStyles[status.trim().toLowerCase()] ?? "bg-gray-100 text-gray-600 ring-gray-200";
}

export function formatRepairRequestCustomer(request: RepairRequest) {
  const customer = request.customer;
  if (!customer) return "—";
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim();
  return name || customer.email || "—";
}

export function formatRepairRequestDate(value: string) {
  if (!value) return "—";

  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
