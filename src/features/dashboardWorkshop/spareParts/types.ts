export type SparePartStatus = "available" | "out_of_stock";

export const SPARE_PART_STATUS_OPTIONS: { value: SparePartStatus; label: string }[] = [
  { value: "available", label: "متوفر" },
  { value: "out_of_stock", label: "غير متوفر" },
];

export type SparePart = {
  id: string;
  company: string;
  companyName: string;
  product_id: string;
  product_name: string;
  category_id: string;
  category_name: string;
  device_model_id: string;
  device_model_name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  status: SparePartStatus;
};

export type SparePartFormValues = {
  company: string;
  product_id: string;
  category_id: string;
  device_model_id: string;
  description: string;
  price: string;
  quantity: string;
  image: string;
  status: SparePartStatus;
};

export const emptySparePartForm: SparePartFormValues = {
  company: "",
  product_id: "",
  category_id: "",
  device_model_id: "",
  description: "",
  price: "",
  quantity: "",
  image: "",
  status: "available",
};
