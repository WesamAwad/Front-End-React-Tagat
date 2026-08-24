export type SparePart = {
  id: string;
  name: string;
  category: string;
  compatibleDevice: string;
  sku: string;
  price: number;
  quantity: number;
};

export type SparePartFormValues = {
  name: string;
  category: string;
  compatibleDevice: string;
  sku: string;
  price: string;
  quantity: string;
};

export const emptySparePartForm: SparePartFormValues = {
  name: "",
  category: "",
  compatibleDevice: "",
  sku: "",
  price: "",
  quantity: "",
};
