export type BookingStatus = "pending" | "repairing" | "completed" | "cancelled";

export const bookingStatusMeta: Record<BookingStatus, { label: string; tabLabel: string; badgeClass: string; barClass: string }> = {
  pending: {
    label: "بانتظار التاكيد",
    tabLabel: "بانتظار التاكيد",
    badgeClass: "bg-[#2196F3]",
    barClass: "bg-[#D3EAFD]",
  },
  repairing: {
    label: "قيد الإصلاح",
    tabLabel: "قيد الاصلاح",
    badgeClass: "bg-[#F57F17]",
    barClass: "bg-[#FDE5D1]",
  },
  completed: {
    label: "مكتملة",
    tabLabel: "مكتملة",
    badgeClass: "bg-[#4CAF50]",
    barClass: "bg-[#DBEFDC]",
  },
  cancelled: {
    label: "ملغاة",
    tabLabel: "ملغاة",
    badgeClass: "bg-[#F44336]",
    barClass: "bg-[#FDD9D7]",
  },
};

export function mapRepairRequestStatus(status: string): BookingStatus | null {
  const key = status.trim().toLowerCase();

  if (["pending", "awaiting", "awaiting_confirmation"].includes(key)) return "pending";
  if (["repairing", "in_progress", "in_repair", "processing", "accepted", "approved", "confirmed"].includes(key)) return "repairing";
  if (["completed", "complete", "done"].includes(key)) return "completed";
  if (["rejected", "cancelled", "canceled"].includes(key)) return "cancelled";

  return null;
}

export function formatBookingDate(value: string) {
  if (!value.trim()) return "—";

  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  const day = new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${day} · ${time}`;
}
