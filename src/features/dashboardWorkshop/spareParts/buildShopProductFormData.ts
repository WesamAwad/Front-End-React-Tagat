import type { SparePartFormValues } from "./types";

export function buildShopProductFormData(values: SparePartFormValues, imageFile: File | null) {
  const formData = new FormData();
  formData.append("product_id", values.product_id);
  formData.append("price", values.price);
  formData.append("quantity", values.quantity);
  formData.append("status", values.status);
  formData.append("description", values.description.trim());

  if (values.device_model_id) {
    formData.append("device_model_id", values.device_model_id);
  }

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return formData;
}
