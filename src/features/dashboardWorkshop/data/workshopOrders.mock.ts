import type { WorkshopOrder } from "../types/workshopOrder";

export const mockWorkshopOrders: WorkshopOrder[] = [
  {
    id: "ORD-1042",
    customerName: "أحمد العتيبي",
    service: "استبدال شاشة iPhone 13",
    vehicle: "iPhone 13 Pro",
    date: "2026-08-22",
    status: "pending",
  },
  {
    id: "ORD-1041",
    customerName: "سارة الحربي",
    service: "تغيير بطارية Samsung S23",
    vehicle: "Samsung Galaxy S23",
    date: "2026-08-21",
    status: "pending",
  },
  {
    id: "ORD-1038",
    customerName: "خالد الدوسري",
    service: "إصلاح منفذ الشحن",
    vehicle: "iPad Air 5",
    date: "2026-08-20",
    status: "approved",
  },
  {
    id: "ORD-1035",
    customerName: "نورة القحطاني",
    service: "فحص وتشخيص جهاز",
    vehicle: "Huawei P50",
    date: "2026-08-19",
    status: "rejected",
  },
  {
    id: "ORD-1032",
    customerName: "فهد المطيري",
    service: "استبدال زجاج الكامéra",
    vehicle: "iPhone 14",
    date: "2026-08-18",
    status: "pending",
  },
];
