import type { SparePart } from "../types/sparePart";

export const mockSpareParts: SparePart[] = [
  {
    id: "SP-001",
    name: "شاشة iPhone 13 Pro",
    category: "شاشات",
    compatibleDevice: "iPhone 13 Pro",
    sku: "SCR-IP13P-OLED",
    price: 450,
    quantity: 12,
  },
  {
    id: "SP-002",
    name: "بطارية Samsung S23",
    category: "بطاريات",
    compatibleDevice: "Samsung Galaxy S23",
    sku: "BAT-S23-ORIG",
    price: 180,
    quantity: 8,
  },
  {
    id: "SP-003",
    name: "فليكس شحن iPhone 14",
    category: "كابلات وموصلات",
    compatibleDevice: "iPhone 14",
    sku: "FLX-IP14-CHG",
    price: 95,
    quantity: 3,
  },
  {
    id: "SP-004",
    name: "زجاج كامéra iPhone 12",
    category: "كامeras",
    compatibleDevice: "iPhone 12",
    sku: "GLS-IP12-CAM",
    price: 120,
    quantity: 15,
  },
];
